from http.client import HTTPException
from typing import List, Optional
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
        "id": 0,
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

    return {"groups": formatted_groups}


class Client(BaseModel):
    id: int
    clientID: str
    createdAt: str
    updatedAt: str
    StaticMetric: Optional[str]
    DynamicMetric: Optional[str]
    Group: Optional[str]
    groupId: Optional[int]


class Group(BaseModel):
    id: int
    name: str
    description: str
    clients: List[Client]


class GroupSaveRequest(BaseModel):
    groups: List[Group]


@router.post("/groups/save", tags=["groups"])
async def save_groups(group_save_payload: GroupSaveRequest):
    for group in group_save_payload.groups:
        for client in group.clients:
            if group.id == 0:
                group.id = None
            await prisma.clients.update(
                where={
                    "id": client.id
                },
                data={
                    "groupId": group.id
                })

    return {"detail": "Groups saved successfully"}
