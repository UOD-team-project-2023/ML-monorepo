import uuid
from fastapi import APIRouter, HTTPException
from db import prisma
from pydantic import BaseModel
from helpers.password import has_numbers, has_lowercase, has_uppercase, has_specialchar

router = APIRouter()


@router.get("/get_all_users", tags=["users"])
async def user_list():
    users = await prisma.users.find_many()
    return users


@router.get("/user/{user_id}", tags=["users"])
async def user_list(user_id: int):
    user = await prisma.users.find_first(where={"id": user_id})
    return user


class Request(BaseModel):
    username: str
    password: str
    access_level: str


@router.post("/create_user", tags=["users"])
async def create_user(request: Request):
    if len(request.username) < 1:
        raise HTTPException(
            status_code=400, detail="Username Length Doesn't Meet Requirements (>1)")
    if len(request.password) < 6:
        raise HTTPException(
            status_code=400, detail="Password length has to be >= 6")
    elif has_numbers(request.password) == False:
        raise HTTPException(
            status_code=400, detail="Password doesn't contain a numeric value")
    elif has_lowercase(request.password) == False:
        raise HTTPException(
            status_code=400, detail="Password doesn't contain a lowercase value")
    elif has_uppercase(request.password) == False:
        raise HTTPException(
            status_code=400, detail="Password doesn't contain a uppercase value")
    elif has_specialchar(request.password) == False:
        raise HTTPException(
            status_code=400, detail="Password doesn't contain a special character")

    user = await prisma.users.create(data={
        "username": request.username,
        "password": request.password,
        "permission": request.access_level,
        "token": str(uuid.uuid4())
    }
    )
    return ({"message": "Registration Confirmed",
             "token": user.token})


@router.get("/check_fts", tags=["users"])
async def check_fts():
    check_admin = await prisma.users.find_first(where={"permission": "ADMIN"})
    if not check_admin:
        raise HTTPException(status_code=404, detail="Not Admin")
    return {"fts": "true"}
