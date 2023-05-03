from fastapi import APIRouter
from fastapi.responses import FileResponse

some_file_path = "./files/install.sh"
router = APIRouter()


@router.get("/install.sh", response_class=FileResponse, tags=["file_nix_probe_install_script"])
async def main():
    return some_file_path
