import asyncio
from collections.abc import AsyncGenerator
from typing import Any

import structlog
from sqlalchemy import text
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase

from app.core.config import settings

logger = structlog.get_logger()


class Base(DeclarativeBase):
    pass


engine: AsyncEngine | None = None
async_session_maker: async_sessionmaker[AsyncSession] | None = None

_USE_SETTINGS: Any = object()


async def init_db(
    database_url: str | None = _USE_SETTINGS,
) -> tuple[AsyncEngine | None, async_sessionmaker[AsyncSession] | None]:
    """Initialize, reconfigure, or reset the async database engine and session factory.

    Any existing active engine is safely disposed before reconfiguration or reset.
    """
    global engine, async_session_maker

    if engine is not None:
        await engine.dispose()
        engine = None
        async_session_maker = None

    url = settings.database_url if database_url is _USE_SETTINGS else database_url
    if not url:
        return None, None

    new_engine = create_async_engine(
        url,
        echo=(settings.env == "dev"),
        pool_pre_ping=True,
    )
    new_session_maker = async_sessionmaker(
        bind=new_engine,
        class_=AsyncSession,
        expire_on_commit=False,
    )
    engine = new_engine
    async_session_maker = new_session_maker
    return engine, async_session_maker


async def close_db() -> None:
    """Close and dispose the async engine connections."""
    global engine, async_session_maker
    if engine is not None:
        try:
            await engine.dispose()
        finally:
            engine = None
            async_session_maker = None


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """FastAPI dependency for obtaining an async database session."""
    if async_session_maker is None:
        raise RuntimeError("Database session factory is not initialized. Check DATABASE_URL.")
    async with async_session_maker() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def check_database_health(timeout_seconds: float = 2.0) -> bool:
    """Perform a lightweight non-mutating ping (SELECT 1) against the database."""
    if engine is None:
        return False
    try:
        async with asyncio.timeout(timeout_seconds):
            async with engine.connect() as conn:
                result = await conn.execute(text("SELECT 1"))
                return result.scalar() == 1
    except Exception as exc:  # noqa: BLE001
        logger.warning("database_health_check_failed", error=str(exc))
        return False
