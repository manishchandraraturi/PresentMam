import pytest
from fastapi import APIRouter
from httpx import ASGITransport, AsyncClient
from pydantic import BaseModel

from app.core.errors import (
    EvidenceUnreadableError,
    NotFoundError,
    PolicyBlockedError,
)
from app.main import create_app

router_for_error_tests = APIRouter(prefix="/test-errors")


class DummyPayload(BaseModel):
    name: str
    age: int


@router_for_error_tests.get("/not-found")
async def trigger_not_found():
    raise NotFoundError("Student not found", details={"student_id": "123"})


@router_for_error_tests.get("/evidence-unreadable")
async def trigger_evidence_unreadable():
    raise EvidenceUnreadableError()


@router_for_error_tests.get("/policy-blocked")
async def trigger_policy_blocked():
    raise PolicyBlockedError("Semester OD quota exceeded", details={"quota": 6, "used": 6})


@router_for_error_tests.post("/validation")
async def trigger_validation(payload: DummyPayload):
    return payload


@router_for_error_tests.get("/unhandled")
async def trigger_unhandled():
    raise RuntimeError("Unexpected boom!")


@pytest.fixture
def error_test_app():
    app = create_app()
    app.include_router(router_for_error_tests)
    return app


@pytest.fixture
async def error_client(error_test_app):
    async with AsyncClient(
        transport=ASGITransport(app=error_test_app, raise_app_exceptions=False),
        base_url="http://test",
    ) as ac:
        yield ac


@pytest.mark.asyncio
async def test_404_error_envelope(error_client: AsyncClient):
    response = await error_client.get("/non-existent-route")
    assert response.status_code == 404
    data = response.json()
    assert "error" in data
    err = data["error"]
    assert err["code"] == "NOT_FOUND"
    assert "message" in err
    assert "details" in err
    assert err["request_id"] == response.headers.get("X-Request-ID")


@pytest.mark.asyncio
async def test_custom_domain_error_not_found(error_client: AsyncClient):
    response = await error_client.get("/test-errors/not-found")
    assert response.status_code == 404
    data = response.json()
    assert "error" in data
    err = data["error"]
    assert err["code"] == "NOT_FOUND"
    assert err["message"] == "Student not found"
    assert err["details"] == {"student_id": "123"}
    assert err["request_id"] == response.headers.get("X-Request-ID")


@pytest.mark.asyncio
async def test_custom_domain_error_evidence_unreadable(error_client: AsyncClient):
    response = await error_client.get("/test-errors/evidence-unreadable")
    assert response.status_code == 422
    data = response.json()
    assert "error" in data
    err = data["error"]
    assert err["code"] == "EVIDENCE_UNREADABLE"
    assert err["message"] == "We couldn't read this file. Try a clearer photo or a PDF."
    assert err["request_id"] == response.headers.get("X-Request-ID")


@pytest.mark.asyncio
async def test_custom_domain_error_policy_blocked(error_client: AsyncClient):
    response = await error_client.get("/test-errors/policy-blocked")
    assert response.status_code == 409
    data = response.json()
    assert "error" in data
    err = data["error"]
    assert err["code"] == "POLICY_BLOCKED"
    assert err["message"] == "Semester OD quota exceeded"
    assert err["details"] == {"quota": 6, "used": 6}
    assert err["request_id"] == response.headers.get("X-Request-ID")


@pytest.mark.asyncio
async def test_validation_error_envelope(error_client: AsyncClient):
    response = await error_client.post("/test-errors/validation", json={"name": "Alice", "age": "not-an-int"})
    assert response.status_code == 422
    data = response.json()
    assert "error" in data
    err = data["error"]
    assert err["code"] == "VALIDATION_FAILED"
    assert "errors" in err["details"]
    assert err["request_id"] == response.headers.get("X-Request-ID")


@pytest.mark.asyncio
async def test_unhandled_exception_returns_500_envelope(error_client: AsyncClient):
    response = await error_client.get("/test-errors/unhandled")
    assert response.status_code == 500
    data = response.json()
    assert "error" in data
    err = data["error"]
    assert err["code"] == "INTERNAL"
    assert err["message"] == "An unexpected error occurred. Please try again."
    assert err["request_id"] == response.headers.get("X-Request-ID")
