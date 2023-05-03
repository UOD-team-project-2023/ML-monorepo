from fastapi import APIRouter, HTTPException
from db import prisma

router = APIRouter()


@router.get("/get_all_users", tags=["users"])
async def user_list():
    users = await prisma.users.find_many()
    return users


@router.get("/user/{user_id}", tags=["users"])
async def user_list(user_id: int):
    user = await prisma.users.find_first(where={"id": user_id})
    return user


@router.post("/create_user/{username}", tags=["users"])
async def create_user(username: str):
    created_user = await prisma.users.create(data={"email": "email@gmail.com", "password": "password123", "username": username})
    return created_user


@router.post("/check_fts", tags=["users"])
async def check_fts():
    check_admin = await prisma.users.find_first(where={"permission": "ADMIN"})
    if not check_admin:
        raise HTTPException(status_code=404, detail="Not Admin")
    return {"fts": "true"}
