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


settings = Settings()
