"""
Backward compatibility entry point.
This file imports from the new modular structure.
For new deployments, use: uvicorn app.main:app
"""
from app.main import app

__all__ = ["app"]
