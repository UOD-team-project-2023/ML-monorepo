from typing import Optional
from fastapi import APIRouter, HTTPException
from db import prisma

router = APIRouter()


@router.get("/metrics", tags=["stats"])
async def metrics(token: str, client_id: Optional[str] = None):
    user = await prisma.users.find_first(where={"token": token})

    if not client_id:
        client = await prisma.clients.find_first()
        client_id = client.clientID

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

    dynamic_metrics = await prisma.dynamicmetric.find_many(
        where={
            "clientID": client_id,
        },
        order={
            "createdAt": "asc",
        },
        skip=skip_records,
        take=graph_plots,
    )

    static_metrics = await prisma.staticmetric.find_first(
        order={
            "createdAt": "desc",
        }
    )

    metrics = {
        "dynamic": dynamic_metrics,
        "static": static_metrics,
    }

    return metrics
