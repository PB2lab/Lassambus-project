"""Main FastAPI application"""
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging
import os

from app.config import CORS_ORIGINS
from app.database import db, client
from app.routers import auth, incidents, hospitals
from app.utils.rate_limit import limiter, RateLimitExceeded

# Initialize logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="LASAMBUS API",
    description="Lagos State Ambulance Service Management System API",
    version="1.0.0"
)

# Add rate limiter to app
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, lambda request, exc: JSONResponse(
    status_code=429,
    content={"detail": f"Rate limit exceeded: {exc.detail}"}
))

# Include routers
app.include_router(auth.router, prefix="/api")
app.include_router(incidents.router, prefix="/api")
app.include_router(hospitals.router, prefix="/api")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=CORS_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup event: Initialize hospital data
@app.on_event("startup")
async def init_data():
    lagos_hospitals = [
        {
            "id": "hosp-1",
            "name": "Lagos State University Teaching Hospital (LASUTH)",
            "address": "1-5 Oba Akinjobi Way, Ikeja",
            "lga": "Ikeja",
            "available_beds": 45,
            "expertise": ["Trauma", "Surgery", "Emergency", "Cardiology", "Pediatrics"],
            "phone": "01-773-6120",
            "latitude": 6.5964,
            "longitude": 3.3486
        },
        {
            "id": "hosp-2",
            "name": "Lagos Island General Hospital",
            "address": "Lagos Island",
            "lga": "Lagos Island",
            "available_beds": 28,
            "expertise": ["Emergency", "Surgery", "Obstetrics"],
            "phone": "01-263-3721",
            "latitude": 6.4541,
            "longitude": 3.3947
        },
        {
            "id": "hosp-3",
            "name": "General Hospital Gbagada",
            "address": "Gbagada Expressway",
            "lga": "Kosofe",
            "available_beds": 32,
            "expertise": ["Trauma", "Pediatrics", "Obstetrics", "Emergency"],
            "phone": "01-763-2109",
            "latitude": 6.5533,
            "longitude": 3.3786
        },
        {
            "id": "hosp-4",
            "name": "Ikorodu General Hospital",
            "address": "Ikorodu Town",
            "lga": "Ikorodu",
            "available_beds": 18,
            "expertise": ["Emergency", "Surgery", "Pediatrics"],
            "phone": "01-891-2034",
            "latitude": 6.6198,
            "longitude": 3.5073
        },
        {
            "id": "hosp-5",
            "name": "General Hospital Badagry",
            "address": "Badagry Town",
            "lga": "Badagry",
            "available_beds": 15,
            "expertise": ["Emergency", "Trauma", "Surgery"],
            "phone": "01-891-5678",
            "latitude": 6.4173,
            "longitude": 2.8876
        },
        {
            "id": "hosp-6",
            "name": "General Hospital Surulere",
            "address": "Randle Avenue, Surulere",
            "lga": "Surulere",
            "available_beds": 25,
            "expertise": ["Cardiology", "Emergency", "Surgery", "Neurology"],
            "phone": "01-583-7421",
            "latitude": 6.4968,
            "longitude": 3.3547
        },
        {
            "id": "hosp-7",
            "name": "Apapa General Hospital",
            "address": "Apapa Road",
            "lga": "Apapa",
            "available_beds": 12,
            "expertise": ["Emergency", "Trauma"],
            "phone": "01-587-2134",
            "latitude": 6.4509,
            "longitude": 3.3594
        },
        {
            "id": "hosp-8",
            "name": "Epe General Hospital",
            "address": "Epe Town",
            "lga": "Epe",
            "available_beds": 10,
            "expertise": ["Emergency", "Obstetrics", "Pediatrics"],
            "phone": "01-705-8291",
            "latitude": 6.5833,
            "longitude": 3.9833
        }
    ]
    
    existing_count = await db.hospitals.count_documents({})
    if existing_count == 0:
        await db.hospitals.insert_many(lagos_hospitals)
        logger.info(f"Initialized {len(lagos_hospitals)} hospitals")

# Shutdown event: Close database connection
@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
