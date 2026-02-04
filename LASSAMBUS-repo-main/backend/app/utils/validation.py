"""Validation utilities"""
from typing import List

# Valid Lagos LGAs
VALID_LAGOS_LGAS = [
    'Agege', 'Ajeromi-Ifelodun', 'Alimosho', 'Amuwo-Odofin', 'Apapa',
    'Badagry', 'Epe', 'Eti-Osa', 'Ibeju-Lekki', 'Ifako-Ijaiye',
    'Ikeja', 'Ikorodu', 'Kosofe', 'Lagos Island', 'Lagos Mainland',
    'Mushin', 'Ojo', 'Oshodi-Isolo', 'Shomolu', 'Surulere'
]

def validate_lga(lga: str) -> bool:
    """Validate that LGA is a valid Lagos LGA"""
    return lga in VALID_LAGOS_LGAS

def get_valid_lgas() -> List[str]:
    """Get list of valid Lagos LGAs"""
    return VALID_LAGOS_LGAS.copy()
