import json
from fastapi import APIRouter, Request
from pydantic import BaseModel
from typing import List
from fastapi.encoders import jsonable_encoder
from db import prisma

router = APIRouter()


class GPU(BaseModel):
    gpu_name: str
    gpu_uuid: str


class CustomRequest(BaseModel):
    system: str
    host_name: str
    release: str
    version: str
    cpu_type: str
    cpu_name: str
    cpu_family: str
    physical_cores: int
    logical_cores: int
    max_frequency: float
    min_frequency: float
    total_ram: int
    gpus: List[GPU]


@router.post("/static_data", tags=["static_data"])
async def static_data(request: Request, custom_request: CustomRequest):
    json_obj = jsonable_encoder(custom_request)
    submitted_metric = await prisma.staticmetric.create(data={
        "clientID": request.headers["client-id"],
        "system": custom_request.system,
        "host_name": custom_request.host_name,
        "release": custom_request.release,
        "version": custom_request.version,
        "cpu_type": custom_request.cpu_type,
        "cpu_name": custom_request.cpu_name,
        "cpu_family": custom_request.cpu_family,
        "physical_cores": custom_request.physical_cores,
        "logical_cores": custom_request.logical_cores,
        "max_frequency": custom_request.max_frequency,
        "min_frequency": custom_request.min_frequency,
        "total_ram": custom_request.total_ram,
        "gpus": json.dumps(json_obj.get("gpus"))
    })

    return {"result": submitted_metric, "message": "success"}
