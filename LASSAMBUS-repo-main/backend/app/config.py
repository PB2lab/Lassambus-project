"""Configuration and environment variable management"""
import os
from pathlib import Path
from dotenv import load_dotenv

ROOT_DIR = Path(__file__).parent.parent
load_dotenv(ROOT_DIR / '.env')

# Validate required environment variables
MONGO_URL = os.environ.get('MONGO_URL')
if not MONGO_URL:
    raise ValueError("MONGO_URL environment variable is required")

DB_NAME = os.environ.get('DB_NAME')
if not DB_NAME:
    raise ValueError("DB_NAME environment variable is required")

JWT_SECRET = os.environ.get('JWT_SECRET')
if not JWT_SECRET:
    raise ValueError("JWT_SECRET environment variable is required. Do not use default secrets in production!")

JWT_ALGORITHM = "HS256"
CORS_ORIGINS = os.environ.get('CORS_ORIGINS', '*').split(',')
