import uuid

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_request_id_generated_when_missing(client: AsyncClient):
    response = await client.get("/healthz")
    assert response.status_code == 200
    req_id = response.headers.get("X-Request-ID")
    assert req_id is not None
    # Validate UUID format
    parsed = uuid.UUID(req_id)
    assert str(parsed) == req_id


@pytest.mark.asyncio
async def test_request_id_preserved_when_provided(client: AsyncClient):
    custom_id = "test-custom-request-id-12345"
    response = await client.get("/healthz", headers={"X-Request-ID": custom_id})
    assert response.status_code == 200
    assert response.headers.get("X-Request-ID") == custom_id
