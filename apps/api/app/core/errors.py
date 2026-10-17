from typing import Any

from pydantic import BaseModel, Field


class ErrorDetail(BaseModel):
    code: str
    message: str
    details: dict[str, Any] = Field(default_factory=dict)
    request_id: str


class ErrorEnvelope(BaseModel):
    error: ErrorDetail


class AppError(Exception):
    """Base application domain error."""

    def __init__(
        self,
        code: str,
        message: str,
        status_code: int = 400,
        details: dict[str, Any] | None = None,
    ):
        super().__init__(message)
        self.code = code
        self.message = message
        self.status_code = status_code
        self.details = details or {}


class NotFoundError(AppError):
    def __init__(
        self,
        message: str = "Resource not found",
        details: dict[str, Any] | None = None,
    ):
        super().__init__(code="NOT_FOUND", message=message, status_code=404, details=details)


class ForbiddenError(AppError):
    def __init__(
        self,
        message: str = "Access forbidden",
        details: dict[str, Any] | None = None,
    ):
        super().__init__(code="FORBIDDEN", message=message, status_code=403, details=details)


class UnauthenticatedError(AppError):
    def __init__(
        self,
        message: str = "Authentication required",
        details: dict[str, Any] | None = None,
    ):
        super().__init__(code="UNAUTHENTICATED", message=message, status_code=401, details=details)


class ValidationFailedError(AppError):
    def __init__(
        self,
        message: str = "Validation failed",
        details: dict[str, Any] | None = None,
    ):
        super().__init__(
            code="VALIDATION_FAILED", message=message, status_code=422, details=details
        )


class PolicyBlockedError(AppError):
    def __init__(
        self,
        message: str = "Action blocked by policy",
        details: dict[str, Any] | None = None,
    ):
        super().__init__(code="POLICY_BLOCKED", message=message, status_code=409, details=details)


class EvidenceUnreadableError(AppError):
    def __init__(
        self,
        message: str = "We couldn't read this file. Try a clearer photo or a PDF.",
        details: dict[str, Any] | None = None,
    ):
        super().__init__(
            code="EVIDENCE_UNREADABLE", message=message, status_code=422, details=details
        )


class DuplicateSubmissionError(AppError):
    def __init__(
        self,
        message: str = "Duplicate submission detected",
        details: dict[str, Any] | None = None,
    ):
        super().__init__(
            code="DUPLICATE_SUBMISSION", message=message, status_code=409, details=details
        )


class ConsentRequiredError(AppError):
    def __init__(
        self,
        message: str = "Consent is required",
        details: dict[str, Any] | None = None,
    ):
        super().__init__(code="CONSENT_REQUIRED", message=message, status_code=409, details=details)


class ProviderUnavailableError(AppError):
    def __init__(
        self,
        message: str = "External provider unavailable",
        details: dict[str, Any] | None = None,
    ):
        super().__init__(
            code="PROVIDER_UNAVAILABLE", message=message, status_code=503, details=details
        )


class ApplyFailedError(AppError):
    def __init__(
        self,
        message: str = "Failed to apply correction",
        details: dict[str, Any] | None = None,
    ):
        super().__init__(code="APPLY_FAILED", message=message, status_code=502, details=details)


class ConflictError(AppError):
    def __init__(
        self,
        message: str = "Conflict detected",
        details: dict[str, Any] | None = None,
    ):
        super().__init__(code="CONFLICT", message=message, status_code=409, details=details)
