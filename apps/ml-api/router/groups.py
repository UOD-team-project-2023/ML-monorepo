from typing import List, Optional
from db import prisma
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from helpers.get_client_host_name import get_client_host_name
from helpers.try_int import try_int

router = APIRouter()


class GroupCreateRequest(BaseModel):
    group_name: str
    group_description: str


@router.post("/groups/create", tags=["groups"])
async def create_group(request: Request, group_create_payload: GroupCreateRequest):
    token = request.headers.get("Authorization")
    if not token:
        raise HTTPException(
            status_code=401, detail="You do not have permission to create groups")
    
    user = await prisma.users.find_first(where={"token": token})
    if not user or user.permission != "ADMIN":
        raise HTTPException(
            status_code=401, detail="You do not have permission to create groups")
    
    group = await prisma.group.find_first(where={"name": group_create_payload.group_name})

    if group:
        raise HTTPException(
            status_code=401, detail="There is already a group with this name")

    await prisma.group.create(
        data={
            "name": group_create_payload.group_name,
            "description": group_create_payload.group_description
        }
    )

    return {"detail": "Group created successfully"}


@router.get("/groups", tags=["groups"])
async def get_groups():
    groups = await prisma.group.find_many()
    clients = await prisma.clients.find_many(include={
        "StaticMetric": True,
    })

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
                client_data = {
                    "id": client.id,
                    "clientID": client.clientID,
                    "createdAt": client.createdAt,
                    "updatedAt": client.updatedAt,
                    "host_name": get_client_host_name(client),
                }

                formatted_group["clients"].append(client_data)
        formatted_groups.append(formatted_group)

    groupless_clients = []
    for client in clients:
        if not client.groupId:
            client_data = {
                "id": client.id,
                "clientID": client.clientID,
                "createdAt": client.createdAt,
                "updatedAt": client.updatedAt,
                "host_name": get_client_host_name(client),
            }
            groupless_clients.append(client_data)
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
async def save_groups(request: Request, group_save_payload: GroupSaveRequest):
    token = request.headers.get("Authorization")
    
    if not token:
        raise HTTPException(
            status_code=401, detail="You do not have permission to save groups")
    
    user = await prisma.users.find_first(where={"token": token})
    if not user or user.permission != "ADMIN":
        raise HTTPException(
            status_code=401, detail="You do not have permission to save groups")
    
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


@router.delete("/groups/delete", tags=["users"])
async def users(group_id: str, token: str):
    if not token:
        raise HTTPException(
            status_code=401, detail="You do not have permission to delete this group")
    
    user = await prisma.users.find_first(where={"token": token})

    if not user or user.permission != "ADMIN":
        raise HTTPException(status_code=401, detail="You do not have permission to delete this group")
    
    group_id = try_int(group_id)
    if not group_id:
        raise HTTPException(status_code=400, detail="Invalid group ID")

    await prisma.group.delete(where={"id": group_id})

    return {"detail": "Successfully deleted group"}
