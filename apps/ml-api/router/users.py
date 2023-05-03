import uuid
from fastapi import APIRouter, HTTPException
from db import prisma
from pydantic import BaseModel

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


def has_numbers(input_string):
    return any(char.isdigit() for char in input_string)


def has_lowercase(input_string):
    return any(char.islower() for char in input_string)


def has_uppercase(input_string):
    return any(char.isupper() for char in input_string)


def has_specialchar(input_string):
    specialcharacters = "!@#$%^&*()-+?=,<>/"
    return any(char in specialcharacters for char in input_string)


@router.post("/create_user", tags=["users"])
async def create_user(request: Request):
    # created_user = await prisma.users.create(data={"email": "email@gmail.com", "password": "password123", "username": username})
    # return created_user
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
