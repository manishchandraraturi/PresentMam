from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

import structlog
from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.core.config import settings
from app.core.errors import AppError, ErrorDetail, ErrorEnvelope
from app.core.logging import setup_logging
from app.core.middleware import RequestIdMiddleware
from app.db.session import close_db, init_db
from app.routers import health

logger = structlog.get_logger()


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Manage application startup and shutdown lifecycle."""
    try:
        if settings.database_url:
            await init_db(settings.database_url)
        yield
    finally:
        await close_db()


def create_app() -> FastAPI:
    """Create and configure the FastAPI application."""
    setup_logging(json_logs=(settings.env != "test"))

    app = FastAPI(
        title=settings.app_name,
        lifespan=lifespan,
        docs_url=f"{settings.api_prefix}/docs" if settings.env != "prod" else None,
        redoc_url=None,
    )

    # Middleware
    app.add_middleware(RequestIdMiddleware)

    # Global Exception Handlers
    @app.exception_handler(AppError)
    async def app_error_handler(request: Request, exc: AppError) -> JSONResponse:
        request_id = getattr(request.state, "request_id", "unknown")
        logger.warning(
            "app_error",
            code=exc.code,
            message=exc.message,
            status_code=exc.status_code,
            details=exc.details,
            request_id=request_id,
        )
        envelope = ErrorEnvelope(
            error=ErrorDetail(
                code=exc.code,
                message=exc.message,
                details=exc.details,
                request_id=request_id,
            )
        )
        return JSONResponse(
            status_code=exc.status_code,
            content=envelope.model_dump(),
            headers={"X-Request-ID": request_id},
        )

    @app.exception_handler(RequestValidationError)
    async def validation_error_handler(
        request: Request, exc: RequestValidationError
    ) -> JSONResponse:
        request_id = getattr(request.state, "request_id", "unknown")
        details = {"errors": exc.errors()}
        logger.warning(
            "validation_error",
            code="VALIDATION_FAILED",
            details=details,
            request_id=request_id,
        )
        envelope = ErrorEnvelope(
            error=ErrorDetail(
                code="VALIDATION_FAILED",
                message="Validation failed",
                details=details,
                request_id=request_id,
            )
        )
        return JSONResponse(
            status_code=422,
            content=envelope.model_dump(),
            headers={"X-Request-ID": request_id},
        )

    @app.exception_handler(StarletteHTTPException)
    async def http_exception_handler(request: Request, exc: StarletteHTTPException) -> JSONResponse:
        request_id = getattr(request.state, "request_id", "unknown")
        code_map = {
            401: "UNAUTHENTICATED",
            403: "FORBIDDEN",
            404: "NOT_FOUND",
            409: "CONFLICT",
            422: "VALIDATION_FAILED",
            429: "RATE_LIMITED",
        }
        code = code_map.get(exc.status_code, "HTTP_ERROR")
        logger.warning(
            "http_exception",
            code=code,
            status_code=exc.status_code,
            detail=exc.detail,
            request_id=request_id,
        )
        envelope = ErrorEnvelope(
            error=ErrorDetail(
                code=code,
                message=str(exc.detail),
                details={},
                request_id=request_id,
            )
        )
        return JSONResponse(
            status_code=exc.status_code,
            content=envelope.model_dump(),
            headers={"X-Request-ID": request_id},
        )

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
        request_id = getattr(request.state, "request_id", "unknown")
        logger.error(
            "unhandled_exception",
            error=str(exc),
            exc_info=exc,
            request_id=request_id,
        )
        envelope = ErrorEnvelope(
            error=ErrorDetail(
                code="INTERNAL",
                message="An unexpected error occurred. Please try again.",
                details={},
                request_id=request_id,
            )
        )
        return JSONResponse(
            status_code=500,
            content=envelope.model_dump(),
            headers={"X-Request-ID": request_id},
        )

    # Routers
    app.include_router(health.router)

    return app


app = create_app()
