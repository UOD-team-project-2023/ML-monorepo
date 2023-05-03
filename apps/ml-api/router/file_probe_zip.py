from fastapi import APIRouter
from fastapi.responses import FileResponse

some_file_path = "./files/client.zip"
router = APIRouter()


@router.get("/file/client.zip", response_class=FileResponse, tags=["file_probe_zip"])
async def main():
    return some_file_path
