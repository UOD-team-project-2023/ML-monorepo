from fastapi import APIRouter
from db import prisma

router = APIRouter()


@router.get("/metrics", tags=["stats"])
async def user_list(client_id: str):
    metrics = await prisma.dynamicmetric.find_many(where={
        "clientID": client_id,
    })
    return metrics
