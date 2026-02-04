"""Incident routes"""
from fastapi import APIRouter, HTTPException, Depends
from typing import List
from datetime import datetime

from app.models.incident import Incident, IncidentCreate, IncidentUpdate
from app.utils.jwt import verify_token
from app.database import db

router = APIRouter(prefix="/incidents", tags=["incidents"])

@router.post("", response_model=Incident)
async def create_incident(incident_data: IncidentCreate, payload: dict = Depends(verify_token)):
    user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    incident_obj = Incident(
        **incident_data.model_dump(),
        personnel_id=user['id'],
        personnel_name=user['full_name']
    )
    
    doc = incident_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.incidents.insert_one(doc)
    return incident_obj

@router.get("", response_model=List[Incident])
async def get_incidents(
    skip: int = 0,
    limit: int = 50,
    payload: dict = Depends(verify_token)
):
    """
    Get incidents with pagination.
    - Personnel can only see their own incidents
    - Admins can see all incidents
    """
    query = {}
    if payload["role"] == "personnel":
        query["personnel_id"] = payload["sub"]
    
    # Validate pagination parameters
    skip = max(0, skip)
    limit = min(max(1, limit), 100)  # Limit between 1 and 100
    
    incidents = await db.incidents.find(query, {"_id": 0})\
        .sort("created_at", -1)\
        .skip(skip)\
        .limit(limit)\
        .to_list(limit)
    
    for incident in incidents:
        if isinstance(incident['created_at'], str):
            incident['created_at'] = datetime.fromisoformat(incident['created_at'])
    
    return incidents

@router.patch("/{incident_id}", response_model=Incident)
async def update_incident(incident_id: str, update_data: IncidentUpdate, payload: dict = Depends(verify_token)):
    incident = await db.incidents.find_one({"id": incident_id}, {"_id": 0})
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    
    update_fields = {
        "transfer_to_hospital": update_data.transfer_to_hospital,
        "hospital_id": update_data.hospital_id
    }
    
    await db.incidents.update_one(
        {"id": incident_id},
        {"$set": update_fields}
    )
    
    updated_incident = await db.incidents.find_one({"id": incident_id}, {"_id": 0})
    if isinstance(updated_incident['created_at'], str):
        updated_incident['created_at'] = datetime.fromisoformat(updated_incident['created_at'])
    
    return Incident(**updated_incident)
