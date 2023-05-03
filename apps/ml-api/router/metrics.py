from fastapi import APIRouter, HTTPException
from db import prisma

router = APIRouter()


@router.get("/metrics", tags=["stats"])
async def metrics(client_id: str, token: str):
    user = await prisma.users.find_first(where={"token": token})

    if not user:
        raise HTTPException(
            status_code=400, detail="Unauthorized")

    metrics = await prisma.dynamicmetric.find_many(where={
        "clientID": client_id,
    })
    return metrics
