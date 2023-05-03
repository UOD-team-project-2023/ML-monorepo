from fastapi import APIRouter, Request
from fastapi.exceptions import HTTPException
import os

router = APIRouter()


@router.post("/validatePSK", tags=["validatePSK"])
async def create_user(request: Request):

    if request.headers.get("PSK") != os.environ.get("PSK"):
        raise HTTPException(status_code=401, detail=f"unauthorized")
    
    return {"status": 200, "message": "success"}