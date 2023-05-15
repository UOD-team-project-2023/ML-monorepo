from fastapi import APIRouter
from fastapi.responses import FileResponse

some_file_path = "./files/install.ps1"
router = APIRouter()


@router.get("/install.ps1", response_class=FileResponse, tags=["file_win_probe_install_script"])
async def main():
    return some_file_path
