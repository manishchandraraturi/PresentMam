from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from sqlalchemy.ext.asyncio import AsyncEngine

import app.db.session as db_session
from app.core.config import settings
from app.db.session import (
    check_database_health,
    close_db,
    get_db,
    init_db,
)
from app.main import lifespan


@pytest.fixture(autouse=True)
async def cleanup_db_engine():
    """Ensure engine and session factory references are safely restored after each test."""
    saved_engine = db_session.engine
    saved_session_maker = db_session.async_session_maker
    try:
        yield
    finally:
        current_engine = db_session.engine
        try:
            if isinstance(current_engine, AsyncEngine):
                await close_db()
        finally:
            db_session.engine = saved_engine
            db_session.async_session_maker = saved_session_maker


@pytest.mark.asyncio
async def test_init_db_and_close_db():
    """Verify init_db initializes the engine and close_db disposes it."""
    engine, session_maker = await init_db("postgresql+asyncpg://user:pass@localhost:5432/test")
    assert engine is not None
    assert session_maker is not None

    await close_db()
    assert db_session.engine is None
    assert db_session.async_session_maker is None


@pytest.mark.asyncio
async def test_init_db_none():
    """Verify init_db with None resets engine and session maker."""
    engine, session_maker = await init_db(None)
    assert engine is None
    assert session_maker is None


@pytest.mark.asyncio
async def test_init_db_disposes_existing_engine_on_reset():
    """Verify init_db(None) disposes an existing active engine before resetting."""
    mock_engine = MagicMock()
    mock_engine.dispose = AsyncMock()
    db_session.engine = mock_engine
    db_session.async_session_maker = MagicMock()

    engine, session_maker = await init_db(None)
    assert engine is None
    assert session_maker is None
    assert db_session.engine is None
    assert db_session.async_session_maker is None
    mock_engine.dispose.assert_awaited_once()


@pytest.mark.asyncio
async def test_init_db_disposes_existing_engine_on_replacement():
    """Verify init_db("new_url") disposes an existing active engine before replacing."""
    mock_engine = MagicMock()
    mock_engine.dispose = AsyncMock()
    db_session.engine = mock_engine

    engine, session_maker = await init_db("postgresql+asyncpg://user:pass@localhost:5432/new_db")
    assert engine is not None
    assert engine != mock_engine
    assert session_maker is not None
    mock_engine.dispose.assert_awaited_once()

    await close_db()


@pytest.mark.asyncio
async def test_init_db_disposal_failure_propagates_on_reset():
    """Verify that an exception during engine disposal propagates on reset."""
    mock_engine = MagicMock()
    mock_engine.dispose = AsyncMock(side_effect=RuntimeError("Disposal failed on reset"))
    db_session.engine = mock_engine

    with pytest.raises(RuntimeError, match="Disposal failed on reset"):
        await init_db(None)

    assert db_session.engine is mock_engine
    mock_engine.dispose.assert_awaited_once()


@pytest.mark.asyncio
async def test_init_db_disposal_failure_propagates_on_replacement():
    """Verify disposal exception propagates and no replacement engine is created."""
    mock_engine = MagicMock()
    mock_engine.dispose = AsyncMock(side_effect=RuntimeError("Disposal failed on replacement"))
    db_session.engine = mock_engine

    with pytest.raises(RuntimeError, match="Disposal failed on replacement"):
        await init_db("postgresql+asyncpg://user:pass@localhost:5432/never_created_db")

    assert db_session.engine is mock_engine
    mock_engine.dispose.assert_awaited_once()


@pytest.mark.asyncio
async def test_init_db_default_uses_settings():
    """Verify init_db() with no arguments uses settings.database_url."""
    with patch.object(
        settings, "database_url", "postgresql+asyncpg://user:pass@localhost:5432/from_settings"
    ):
        engine, session_maker = await init_db()
        assert engine is not None
        assert engine.url.database == "from_settings"
        assert engine.url.username == "user"
        assert session_maker is not None

        await close_db()


@pytest.mark.asyncio
async def test_lifespan_normal_exit():
    """Verify close_db() is called when lifespan exits normally."""
    app = MagicMock()
    with (
        patch("app.main.init_db", new_callable=AsyncMock) as mock_init,
        patch("app.main.close_db", new_callable=AsyncMock) as mock_close,
        patch.object(
            settings,
            "database_url",
            "postgresql+asyncpg://user:pass@localhost:5432/test_lifespan",
        ),
    ):
        async with lifespan(app):
            mock_init.assert_awaited_once_with(
                "postgresql+asyncpg://user:pass@localhost:5432/test_lifespan"
            )
            mock_close.assert_not_awaited()
        mock_close.assert_awaited_once()


@pytest.mark.asyncio
async def test_lifespan_exception_exit():
    """Verify close_db() is executed when an exception occurs inside the lifespan context."""
    app = MagicMock()
    with (
        patch("app.main.init_db", new_callable=AsyncMock) as mock_init,
        patch("app.main.close_db", new_callable=AsyncMock) as mock_close,
        patch.object(
            settings,
            "database_url",
            "postgresql+asyncpg://user:pass@localhost:5432/test_lifespan",
        ),
        pytest.raises(ValueError, match="simulated lifespan error"),
    ):
        async with lifespan(app):
            mock_init.assert_awaited_once_with(
                "postgresql+asyncpg://user:pass@localhost:5432/test_lifespan"
            )
            raise ValueError("simulated lifespan error")
    mock_close.assert_awaited_once()


@pytest.mark.asyncio
async def test_lifespan_startup_error_propagates():
    """Verify startup error in init_db propagates and close_db is executed."""
    app = MagicMock()
    with (
        patch(
            "app.main.init_db",
            new_callable=AsyncMock,
            side_effect=ConnectionError("startup connection failed"),
        ),
        patch("app.main.close_db", new_callable=AsyncMock) as mock_close,
        patch.object(
            settings,
            "database_url",
            "postgresql+asyncpg://user:pass@localhost:5432/test_lifespan",
        ),
        pytest.raises(ConnectionError, match="startup connection failed"),
    ):
        async with lifespan(app):
            pass
    mock_close.assert_awaited_once()


@pytest.mark.asyncio
async def test_lifespan_simultaneous_startup_and_cleanup_failure():
    """Verify simultaneous startup and cleanup errors are chained and neither is swallowed."""
    app = MagicMock()
    startup_err = ConnectionError("startup connection failed")
    cleanup_err = RuntimeError("cleanup disposal failed")
    with (
        patch(
            "app.main.init_db",
            new_callable=AsyncMock,
            side_effect=startup_err,
        ),
        patch(
            "app.main.close_db",
            new_callable=AsyncMock,
            side_effect=cleanup_err,
        ) as mock_close,
        patch.object(
            settings,
            "database_url",
            "postgresql+asyncpg://user:pass@localhost:5432/test_lifespan",
        ),
        pytest.raises(RuntimeError, match="cleanup disposal failed") as exc_info,
    ):
        async with lifespan(app):
            pass

    mock_close.assert_awaited_once()
    assert exc_info.value is cleanup_err
    assert exc_info.value.__context__ is startup_err


@pytest.mark.asyncio
async def test_check_database_health_when_none():
    """When engine is None, check_database_health must return False."""
    await close_db()
    is_healthy = await check_database_health()
    assert is_healthy is False


@pytest.mark.asyncio
async def test_check_database_health_success():
    """When engine connects and executes SELECT 1, health check returns True."""
    mock_engine = MagicMock()
    mock_conn = AsyncMock()
    mock_result = MagicMock()
    mock_result.scalar.return_value = 1
    mock_conn.execute.return_value = mock_result
    mock_engine.connect.return_value.__aenter__.return_value = mock_conn

    with patch.object(db_session, "engine", mock_engine):
        is_healthy = await check_database_health()
        assert is_healthy is True


@pytest.mark.asyncio
async def test_check_database_health_failure():
    """When engine connection fails or raises exception, health check returns False."""
    mock_engine = MagicMock()
    mock_engine.connect.side_effect = ConnectionRefusedError("Connection refused")

    with patch.object(db_session, "engine", mock_engine):
        is_healthy = await check_database_health()
        assert is_healthy is False


@pytest.mark.asyncio
async def test_get_db_uninitialized():
    """When database is uninitialized, get_db raises RuntimeError."""
    await close_db()
    gen = get_db()
    with pytest.raises(RuntimeError, match="Database session factory is not initialized"):
        await gen.__anext__()


@pytest.mark.asyncio
async def test_get_db_lifecycle_success():
    """Verify get_db commits and closes on successful iteration."""
    mock_session = AsyncMock()
    mock_session_maker = MagicMock()
    mock_session_maker.return_value.__aenter__.return_value = mock_session

    with patch.object(db_session, "async_session_maker", mock_session_maker):
        sessions = []
        async for session in get_db():
            sessions.append(session)
        assert len(sessions) == 1
        assert sessions[0] == mock_session
        mock_session.commit.assert_awaited_once()
        mock_session.close.assert_awaited_once()


@pytest.mark.asyncio
async def test_get_db_lifecycle_rollback_on_error():
    """Verify get_db rolls back and closes if exception occurs during usage."""
    mock_session = AsyncMock()
    mock_session_maker = MagicMock()
    mock_session_maker.return_value.__aenter__.return_value = mock_session

    with patch.object(db_session, "async_session_maker", mock_session_maker):
        gen = get_db()
        await gen.__anext__()
        with pytest.raises(ValueError, match="simulated failure"):
            await gen.athrow(ValueError("simulated failure"))
        mock_session.rollback.assert_awaited_once()
        mock_session.close.assert_awaited_once()
