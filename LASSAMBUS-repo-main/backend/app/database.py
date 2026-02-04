"""Database connection and initialization"""
from motor.motor_asyncio import AsyncIOMotorClient
from app.config import MONGO_URL, DB_NAME

client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

def get_database():
    """Get database instance"""
    return db
