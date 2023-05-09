import uuid

from helpers.try_int import try_int
from fastapi import APIRouter, HTTPException, Request
from typing import Annotated
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


class CreateUserData(BaseModel):
    username: str
    password: str
    access_level: str


@router.post("/create_user", tags=["users"])
async def create_user(user_payload: CreateUserData):
    if len(user_payload.username) < 1:
        raise HTTPException(
            status_code=400, detail="Username Length must be at least 1 character")
    if len(user_payload.password) < 6:
        raise HTTPException(
            status_code=400, detail="Password length has to be >= 6")
    elif has_numbers(user_payload.password) == False:
        raise HTTPException(
            status_code=400, detail="Password doesn't contain a numeric value")
    elif has_lowercase(user_payload.password) == False:
        raise HTTPException(
            status_code=400, detail="Password doesn't contain a lowercase value")
    elif has_uppercase(user_payload.password) == False:
        raise HTTPException(
            status_code=400, detail="Password doesn't contain a uppercase value")
    elif has_specialchar(user_payload.password) == False:
        raise HTTPException(
            status_code=400, detail="Password doesn't contain a special character")

    check_user = await prisma.users.find_first(
        where={
            "username": user_payload.username
        }
    )
    if check_user:
        raise HTTPException(
            status_code=400, detail="Username already exists")

    user = await prisma.users.create(data={
        "username": user_payload.username,
        "password": user_payload.password,
        "permission": user_payload.access_level,
        "token": str(uuid.uuid4())
    })

    return ({"detail": "Registration Confirmed",
             "token": user.token})


@router.get("/check_fts", tags=["users"])
async def check_fts():
    check_admin = await prisma.users.find_first(where={"permission": "ADMIN"})
    if not check_admin:
        raise HTTPException(status_code=404, detail="No Admin Found")
    return {"fts": "true"}


@router.get("/user_profile", tags=["users"])
async def user_profile(token: str):
    user = await prisma.users.find_first(where={"token": token})
    if not user:
        raise HTTPException(status_code=400, detail="No User found")
    return {"user": user}


@router.get("/users", tags=["users"])
async def users(token: str):
    # TODO: check if token is for admin acc
    users = await prisma.users.find_many()
    if not users:
        raise HTTPException(status_code=400, detail="No User found")

    accounts = []
    for user in users:
        me = False
        if user.token == token:
            me = True
        accounts.append({
            "id": user.id,
            "username": user.username,
            "permission": user.permission,
            "me": me
        })

    return {"users": accounts}


@router.delete("/delete_account", tags=["users"])
async def users(account_id: str, token: str):
    account_id = try_int(account_id)
    action_author = await prisma.users.find_first(where={"token": token})

    if action_author.id == account_id:
        raise HTTPException(
            status_code=400, detail="You can't delete your own account")

    await prisma.users.delete(where={"id": account_id})

    return {"detail": "Successfully deleted user account"}


class EditAccountData(BaseModel):
    account_id: int
    username: str
    permission: str


@router.put("/edit_account", tags=["users"])
async def users(request: Request, account: EditAccountData):
    # TODO: check auth
    token = request.headers.get("authorization")
    action_author = await prisma.users.find_first(where={"token": token})
    if not action_author:
        raise HTTPException(
            status_code=401, detail="You do not have permission to edit other peoples accounts")

    if action_author.permission != "ADMIN":
        raise HTTPException(
            status_code=401, detail="You do not have permission to edit other peoples accounts")

    await prisma.users.update(where={"id": account.account_id}, data={
        "username": account.username,
        "permission": account.permission
    })

    return {"detail": "Successfully edited user account"}
