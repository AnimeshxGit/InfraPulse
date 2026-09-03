import os
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

def resolve_default_model_path() -> str:
    # Check container path
    container_path = Path("/app/model_weights/mobilenet_v3_small_best.pth")
    if container_path.exists():
        return str(container_path)
    # Check local repo path
    local_path = Path(__file__).resolve().parents[1] / "model_weights" / "mobilenet_v3_small_best.pth"
    if local_path.exists():
        return str(local_path)
    return str(container_path)

class Settings(BaseSettings):
    MODEL_WEIGHTS_PATH: str = resolve_default_model_path()
    REDIS_BROKER_URL: str = "redis://localhost:6379/0"
    REDIS_EVENT_URL: str = "redis://localhost:6379/0"
    
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
