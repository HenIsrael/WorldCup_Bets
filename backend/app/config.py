from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application configuration loaded from environment variables / .env."""

    database_url: str = "postgresql+psycopg2://postgres:postgres@localhost:5432/worldcup"
    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"

    # Secret required (via the X-API-Key header) to create/update/delete predictions.
    # Reads stay public. Set a strong value in production (Render env var); never commit it.
    admin_api_key: str = ""

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


settings = Settings()
