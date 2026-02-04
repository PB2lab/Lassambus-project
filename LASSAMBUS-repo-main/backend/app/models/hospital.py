"""Hospital-related Pydantic models"""
from pydantic import BaseModel, ConfigDict, Field
from typing import List

class Hospital(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    name: str
    address: str
    lga: str
    available_beds: int
    expertise: List[str]
    phone: str
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
