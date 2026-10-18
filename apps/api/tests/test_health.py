from unittest.mock import AsyncMock, patch

import pytest
from httpx import ASGITransport, AsyncClient

from app.core.config import Settings
from app.main import create_app


@pytest.mark.asyncio
async def test_healthz(client: AsyncClient):
    """Healthz must return 200 with process status ok and X-Request-ID."""
    response = await client.get("/healthz")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
    assert "X-Request-ID" in response.headers


@pytest.mark.asyncio
async def test_healthz_cors_allowed_origin(client: AsyncClient):
    """Allowed origin receives the expected CORS headers and credentials."""
    response = await client.get("/healthz", headers={"Origin": "http://localhost:3000"})
    assert response.status_code == 200
    assert response.headers.get("access-control-allow-origin") == "http://localhost:3000"
    assert response.headers.get("access-control-allow-credentials") == "true"


@pytest.mark.asyncio
async def test_healthz_cors_untrusted_origin_denied(client: AsyncClient):
    """Untrusted origin does not receive Access-Control-Allow-Origin header."""
    response = await client.get("/healthz", headers={"Origin": "https://untrusted-site.com"})
    assert response.status_code == 200
    assert "access-control-allow-origin" not in response.headers


@pytest.mark.asyncio
async def test_healthz_cors_empty_config_denies_all():
    """Empty or whitespace-only CORS_ORIGINS denies cross-origin access."""
    with patch("app.main.settings.cors_origins", ""):
        app = create_app()
        async with AsyncClient(
            transport=ASGITransport(app=app),
            base_url="http://test",
        ) as ac:
            response = await ac.get("/healthz", headers={"Origin": "http://localhost:3000"})
            assert response.status_code == 200
            assert "access-control-allow-origin" not in response.headers


def test_cors_production_wildcard_rejection():
    """Reject wildcard CORS origin when ENV=prod."""
    with pytest.raises(ValueError, match=r"Wildcard CORS origin '\*' is not allowed when ENV=prod"):
        Settings(env="prod", cors_origins="*")


def test_cors_production_mixed_list_wildcard_rejection():
    """Reject mixed-list wildcard CORS origins when ENV=prod."""
    with pytest.raises(ValueError, match=r"Wildcard CORS origin '\*' is not allowed when ENV=prod"):
        Settings(env="prod", cors_origins="https://example.com, *")


def test_cors_trailing_slash_normalization():
    """Configured origins with whitespace and trailing slashes are normalized cleanly."""
    s = Settings(cors_origins="  http://localhost:3000/ , https://presentmam.vercel.app///  ")
    assert s.cors_origins_list == ["http://localhost:3000", "https://presentmam.vercel.app"]


@pytest.mark.asyncio
async def test_cors_trailing_slash_matching():
    """Trailing-slash configured origin matches incoming browser Origin without slash."""
    with patch("app.main.settings.cors_origins", "http://localhost:3000/"):
        app = create_app()
        async with AsyncClient(
            transport=ASGITransport(app=app),
            base_url="http://test",
        ) as ac:
            response = await ac.get("/healthz", headers={"Origin": "http://localhost:3000"})
            assert response.status_code == 200
            assert response.headers.get("access-control-allow-origin") == "http://localhost:3000"


def test_cors_dev_wildcard_allowed():
    """Wildcard CORS origin is preserved in non-production environments."""
    s = Settings(env="dev", cors_origins="*")
    assert s.cors_origins_list == ["*"]


@pytest.mark.asyncio
async def test_cors_wildcard_disables_credentials():
    """Wildcard CORS origin disables credentials."""
    with patch("app.main.settings.env", "dev"), patch("app.main.settings.cors_origins", "*"):
        app = create_app()
        async with AsyncClient(
            transport=ASGITransport(app=app),
            base_url="http://test",
        ) as ac:
            response = await ac.get("/healthz", headers={"Origin": "http://localhost:3000"})
            assert response.status_code == 200
            assert response.headers.get("access-control-allow-origin") == "*"
            assert "access-control-allow-credentials" not in response.headers


@pytest.mark.asyncio
async def test_readyz_disconnected(client: AsyncClient):
    """Readyz must return 503 when the database is disconnected or unconfigured."""
    with patch("app.routers.health.check_database_health", new_callable=AsyncMock) as mock_ping:
        mock_ping.return_value = False
        response = await client.get("/readyz")
        assert response.status_code == 503
        assert response.json() == {"status": "not_ready", "database": "disconnected"}
        assert "X-Request-ID" in response.headers


@pytest.mark.asyncio
async def test_readyz_connected(client: AsyncClient):
    """Readyz must return 200 when the database is healthy."""
    with patch("app.routers.health.check_database_health", new_callable=AsyncMock) as mock_ping:
        mock_ping.return_value = True
        response = await client.get("/readyz")
        assert response.status_code == 200
        assert response.json() == {"status": "ready", "database": "connected"}
        assert "X-Request-ID" in response.headers
