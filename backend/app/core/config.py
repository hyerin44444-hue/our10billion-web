from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "My App"
    debug: bool = False
    allowed_origins: str = "http://localhost:5173"

    class Config:
        env_file = ".env"


settings = Settings()
