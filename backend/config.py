import os

class Config:
    #Look for Render's DATABASE_URL, fallback to your local Postgres for development
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        'DATABASE_URL', 
        'postgresql://salon_user:password123@localhost:5432/salon_db'
    )
    
    # Fix the "postgres://" vs "postgresql://" issue automatically
    if SQLALCHEMY_DATABASE_URI.startswith("postgres://"):
        SQLALCHEMY_DATABASE_URI = SQLALCHEMY_DATABASE_URI.replace("postgres://", "postgresql://", 1)

    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Add connection pooling to prevent timeouts on Render
    SQLALCHEMY_ENGINE_OPTIONS = {
        "pool_pre_ping": True,
        "pool_recycle": 300,
    }
