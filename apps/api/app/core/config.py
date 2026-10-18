from typing import Self

from pydantic import model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_name: str = "PresentMam API"
    env: str = "dev"
    api_prefix: str = "/api/v1"
    database_url: str | None = None
    cors_origins: str = "http://localhost:3000,http://127.0.0.1:3000"

    @property
    def cors_origins_list(self) -> list[str]:
        raw_origins = [
            origin.strip().rstrip("/") for origin in self.cors_origins.split(",") if origin.strip()
        ]
        if "*" in raw_origins:
            if self.env == "prod":
                raise ValueError("Wildcard CORS origin '*' is not allowed when ENV=prod.")
            return ["*"]
        return list(dict.fromkeys(raw_origins))

    @model_validator(mode="after")
    def validate_cors_origins(self) -> Self:
        _ = self.cors_origins_list
        return self


settings = Settings()
