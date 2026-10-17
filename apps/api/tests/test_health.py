from unittest.mock import AsyncMock, patch

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_healthz(client: AsyncClient):
    """Healthz must return 200 with process status ok and X-Request-ID."""
    response = await client.get("/healthz")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
    assert "X-Request-ID" in response.headers


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
