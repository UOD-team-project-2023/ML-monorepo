from datetime import datetime
from http.client import HTTPException
import json
from fastapi import APIRouter, Request
from pydantic import BaseModel
from typing import List
from fastapi.encoders import jsonable_encoder
from db import prisma
import os

router = APIRouter()


class core_utilizations(BaseModel):
    core: int
    utilization: float


class gpu_utilizations(BaseModel):
    gpu_id: int
    gpu_load: float
    gpu_free_memory: float
    gpu_used_memory: float
    gpu_total_memory: float
    gpu_temperature: float
    gpu_uuid: str


class partition(BaseModel):
    device: str
    mount: str
    filesystem: str
    total_size: int
    used: int
    free: int
    free_percent: float


class adapter_information(BaseModel):
    if_name: str
    ipv4_addr: str
    ipv4_netmask: str
    ipv6: str
    mac: str


class dns(BaseModel):
    dns_server: str


class CustomRequest(BaseModel):
    boot_time: str
    current_frequency: float
    total_cpu_usage: float
    core_utilization: List[core_utilizations]
    total_ram_usage: float
    available_ram: int
    used_ram: int
    ram_percent: float
    total_swap: int
    free_swap: int
    used_swap: int
    swap_percent: float
    total_bytes_sent: int
    total_bytes_received: int
    total_bytes_read: int
    total_bytes_written: int
    gpu_usage: List[gpu_utilizations]
    partitions: List[partition]
    adapter_information: List[adapter_information]
    dns: List[dns]


@router.post("/dynamic_data", tags=["dynamic_data"])
async def static_data(request: Request, custom_request: CustomRequest):

    if request.headers.get("PSK") != os.environ.get("PSK"):
        raise HTTPException(status_code=401, detail=f"unauthorized")

    json_obj = jsonable_encoder(custom_request)
    date_format = "%Y/%m/%d %H:%M:%S"

    submitted_metric = await prisma.dynamicmetric.create(data={
        "clientID": request.headers["client-id"],
        "boot_time":  datetime.strptime(custom_request.boot_time, date_format),
        "current_frequency": custom_request.current_frequency,
        "total_cpu_usage": custom_request.total_cpu_usage,
        "core_utilization": json.dumps(json_obj.get("core_utilization")),
        "total_ram_usage": custom_request.total_ram_usage,
        "available_ram": custom_request.available_ram,
        "used_ram": custom_request.used_ram,
        "ram_percent": custom_request.ram_percent,
        "total_swap": custom_request.total_swap,
        "free_swap": custom_request.free_swap,
        "used_swap": custom_request.used_swap,
        "swap_percent": custom_request.swap_percent,
        "total_bytes_sent": custom_request.total_bytes_sent,
        "total_bytes_received": custom_request.total_bytes_received,
        "total_bytes_read": custom_request.total_bytes_read,
        "total_bytes_written": custom_request.total_bytes_written,
        "gpu_usage": json.dumps(json_obj.get("gpu_usage")),
        "partitions": json.dumps(json_obj.get("partitions")),
        "adapter_information": json.dumps(json_obj.get("adapter_information")),
        "dns": json.dumps(json_obj.get("dns")),
    })

    return {"result": submitted_metric, "message": "success"}
