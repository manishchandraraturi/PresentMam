from fastapi import APIRouter, status
from fastapi.responses import JSONResponse

from app.db.session import check_database_health

router = APIRouter(tags=["health"])


@router.get("/healthz")
async def healthz() -> dict[str, str]:
    """Process-level liveness probe. Does not depend on external services."""
    return {"status": "ok"}


@router.get(
    "/readyz",
    responses={
        200: {"description": "Service and database connection are ready"},
        503: {"description": "Database connection is unavailable or unconfigured"},
    },
)
async def readyz() -> JSONResponse:
    """Readiness check verifying database connectivity."""
    is_ready = await check_database_health()
    if is_ready:
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={"status": "ready", "database": "connected"},
        )
    return JSONResponse(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        content={"status": "not_ready", "database": "disconnected"},
    )
