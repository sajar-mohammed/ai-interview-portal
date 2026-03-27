from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    APP_NAME: str = "Interview AI"
    DEBUG: bool = False
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    SUPABASE_URL: str
    SUPABASE_ANON_KEY: str
    GROQ_API_KEY: str
    GOOGLE_API_KEY: str


    class Config:
        env_file = ".env"
        env_file_encoding = 'utf-8'
        extra = "ignore"

@lru_cache
def get_settings() -> Settings:
    return Settings()
    
