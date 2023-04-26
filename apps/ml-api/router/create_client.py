from fastapi import APIRouter, Request
from db import prisma

router = APIRouter()


@router.post("/create_client", tags=["clients"])
async def create_user(request: Request):
    client_id = await prisma.dynamicmetric.find_first(where={
        "clientID": request.headers["client-id"],
    })

    if not client_id:
        await prisma.clients.create(data={"clientID": request.headers["client-id"]})
