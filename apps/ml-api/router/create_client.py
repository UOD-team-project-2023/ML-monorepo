from fastapi import APIRouter, Request
from db import prisma
from fastapi.exceptions import HTTPException
import os

router = APIRouter()


@router.post("/create_client", tags=["clients"])
async def create_client(request: Request):
    if request.headers.get("PSK") != os.environ.get("PSK"):
        raise HTTPException(status_code=401, detail=f"unauthorized")

    client_id = await prisma.dynamicmetric.find_first(where={
        "clientID": request.headers["client-id"],
    })

    if not client_id:
        await prisma.clients.create(data={"clientID": request.headers["client-id"]})
