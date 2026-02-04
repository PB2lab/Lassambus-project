"""Hospital routes"""
from fastapi import APIRouter
from typing import List, Optional

from app.models.hospital import Hospital
from app.utils.distance import haversine_distance
from app.database import db

router = APIRouter(prefix="/hospitals", tags=["hospitals"])

@router.get("", response_model=List[Hospital])
async def get_hospitals():
    hospitals = await db.hospitals.find({}, {"_id": 0}).to_list(100)
    return hospitals

@router.get("/nearby")
async def get_nearby_hospitals(lat: float, lon: float, condition: Optional[str] = None):
    """
    Get nearby hospitals sorted by distance using Haversine formula.
    Returns up to 10 hospitals, optionally filtered by bed availability.
    """
    hospitals = await db.hospitals.find({}, {"_id": 0}).to_list(100)
    
    # Calculate distance for each hospital using Haversine formula
    for hospital in hospitals:
        hospital['distance'] = haversine_distance(
            lat, lon,
            hospital['latitude'],
            hospital['longitude']
        )
    
    # Sort by distance
    hospitals.sort(key=lambda x: x['distance'])
    
    # Filter by bed availability if condition is specified
    if condition:
        hospitals = [h for h in hospitals if h['available_beds'] > 0]
    
    return hospitals[:10]
