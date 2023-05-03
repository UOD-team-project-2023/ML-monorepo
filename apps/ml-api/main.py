import os
import uvicorn

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from helpers.try_int import try_int
from router import create_client, users, test, static_data, dynamic_data, metrics, file_nix_probe_install_script, file_win_probe_install_script, file_probe_zip
from db import prisma

app = FastAPI()
app.include_router(users.router)
app.include_router(test.router)
app.include_router(static_data.router)
app.include_router(dynamic_data.router)
app.include_router(metrics.router)
app.include_router(create_client.router)
app.include_router(file_nix_probe_install_script.router)
app.include_router(file_win_probe_install_script.router)
app.include_router(file_probe_zip.router)


origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup():
    await prisma.connect()


if __name__ == "__main__":
    host = os.environ.get("HOST")
    port = try_int(os.environ.get("PORT"))
    uvicorn.run("main:app", host=host, port=port, reload=True)
