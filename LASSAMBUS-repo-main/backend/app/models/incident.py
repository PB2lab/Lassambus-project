"""Incident-related Pydantic models"""
import uuid
from datetime import datetime, timezone
from pydantic import BaseModel, Field, ConfigDict, field_validator
from typing import Optional
from app.utils.validation import validate_lga, get_valid_lgas

class Incident(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    patient_name: str
    patient_age: Optional[int] = None
    patient_sex: str
    location: str
    lga: str
    description: str
    action_taken: str
    transfer_to_hospital: bool = False
    hospital_id: Optional[str] = None
    personnel_id: str
    personnel_name: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class IncidentCreate(BaseModel):
    patient_name: str = Field(..., min_length=1, max_length=200)
    patient_age: Optional[int] = Field(None, ge=0, le=150)
    patient_sex: str = Field(..., pattern="^(Male|Female)$")
    location: str = Field(..., min_length=1, max_length=500)
    lga: str = Field(..., min_length=1, max_length=100)
    description: str = Field(..., min_length=10, max_length=2000)
    action_taken: str = Field(..., min_length=10, max_length=2000)
    transfer_to_hospital: bool = False
    hospital_id: Optional[str] = None
    
    @field_validator('lga')
    @classmethod
    def validate_lga(cls, v):
        if not validate_lga(v):
            valid_lgas = ', '.join(get_valid_lgas()[:5])  # Show first 5
            raise ValueError(f'Invalid LGA. Must be one of the valid Lagos LGAs (e.g., {valid_lgas}...)')
        return v
    
    @field_validator('patient_name', 'location', 'description', 'action_taken')
    @classmethod
    def validate_text_fields(cls, v):
        """Sanitize text fields - remove extra whitespace"""
        if isinstance(v, str):
            return ' '.join(v.strip().split())
        return v

class IncidentUpdate(BaseModel):
    transfer_to_hospital: bool
    hospital_id: Optional[str] = None
