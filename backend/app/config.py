from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache
from pathlib import Path
from sqlalchemy.engine import URL
from pydantic import field_validator


class Settings(BaseSettings):
    # --- Base de datos MySQL 8.0 ---
    DB_HOST: str = "localhost"
    DB_PORT: int = 3306
    DB_USER: str = "root"
    DB_PASSWORD: str = ""
    DB_NAME: str = "radiografia_ciudadana"

    # --- Ruta a datos oficiales del INE ---
    DATA_PATH: str = str(Path(__file__).resolve().parents[2] / "data")

    # --- API ---
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8000
    API_RELOAD: bool = True

    # --- Seguridad ---
    SECRET_KEY: str = "cambiar-esta-clave-en-produccion"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # --- Entorno ---
    ENVIRONMENT: str = "development"
    DEBUG: bool = False
    CORS_ORIGINS: list[str] = ["http://localhost:5173", "http://127.0.0.1:5173"]

    @field_validator('DATA_PATH')
    @classmethod
    def resolve_data_path(cls, value: str) -> str:
        path = Path(value).expanduser()
        return str(path if path.is_absolute() else (Path(__file__).resolve().parents[1] / path).resolve())

    @property
    def database_url(self) -> str:
        return URL.create("mysql+pymysql", username=self.DB_USER, password=self.DB_PASSWORD,
                          host=self.DB_HOST, port=self.DB_PORT, database=self.DB_NAME,
                          query={"charset": "utf8mb4"}).render_as_string(hide_password=False)

    model_config = SettingsConfigDict(env_file=str(Path(__file__).resolve().parents[1] / ".env"), env_file_encoding="utf-8")


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
