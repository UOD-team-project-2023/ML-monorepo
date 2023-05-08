from fastapi import APIRouter, HTTPException
from db import prisma

router = APIRouter()


@router.get("/metrics", tags=["stats"])
async def metrics(client_id: str, token: str):
    user = await prisma.users.find_first(where={"token": token})

    if not user:
        raise HTTPException(
            status_code=400, detail="Unauthorized")

    total_count = await prisma.dynamicmetric.count(
        where={
            "clientID": client_id,
        }
    )
    graph_plots = 50
    skip_records = max(0, total_count - graph_plots)

    metrics = await prisma.dynamicmetric.find_many(
        where={
            "clientID": client_id,
        },
        order={
            "createdAt": "asc",
        },
        skip=skip_records,
        take=graph_plots,
    )

    return metrics
