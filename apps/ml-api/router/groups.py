from http.client import HTTPException
from db import prisma
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


class GroupCreateRequest(BaseModel):
    group_name: str
    group_description: str


@router.post("/groups/create", tags=["groups"])
async def create_group(request: GroupCreateRequest):
    group = await prisma.group.find_first(where={"name": request.group_name})

    if group:
        raise HTTPException(
            status_code=401, detail="There is already a group with this name")

    await prisma.group.create(
        data={
            "name": request.group_name,
            "description": request.group_description
        }
    )

    return {"detail": "Group created successfully"}


@router.get("/groups", tags=["groups"])
async def get_groups():
    groups = await prisma.group.find_many()
    clients = await prisma.clients.find_many()
    formatted_groups = [{
        "id": "uncategorized",
        "name": "Uncategorized",
        "description": "Clients that are not in any group",
        "clients": []
    }]
    for group in groups:
        formatted_group = {
            "id": group.id,
            "name": group.name,
            "description": group.description,
            "clients": []
        }
        for client in clients:
            if client.groupId == group.id:
                formatted_group["clients"].append(client)
        formatted_groups.append(formatted_group)

    groupless_clients = []
    for client in clients:
        if not client.groupId:
            groupless_clients.append(client)
    formatted_groups[0]["clients"] = groupless_clients

    print(formatted_groups)

    return {"groups": formatted_groups}
