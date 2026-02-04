"""Rate limiting utilities"""
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi import Request

# Create limiter instance
limiter = Limiter(key_func=get_remote_address)

def get_rate_limit_key(request: Request) -> str:
    """Get rate limit key from request (IP address)"""
    return get_remote_address(request)
