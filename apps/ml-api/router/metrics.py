from fastapi import APIRouter, HTTPException, Response
from db import prisma
import csv

router = APIRouter()


@router.get("/metrics", tags=["metrics"])
async def metrics(client_id: str, token: str):
    user = await prisma.users.find_first(where={"token": token})

    if not user:
        raise HTTPException(
            status_code=400, detail="Unauthorized")

    total_count = await prisma.dynamicmetric.count(
        where={
            "clientID": client_id,
        }
    )
    graph_plots = 50
    skip_records = max(0, total_count - graph_plots)

    metrics = await prisma.dynamicmetric.find_many(
        where={
            "clientID": client_id,
        },
        order={
            "createdAt": "asc",
        },
        skip=skip_records,
        take=graph_plots,
    )
    return metrics

@router.get("/metrics/export", tags=["metrics"])
async def metrics(client_id: str, token: str):
    dynamic_metrics = await prisma.dynamicmetric.find_many(where={"clientID": client_id})
    
    export_data = [
        "id",                
        "clientID",           
        "createdAt",          
        "boot_time",          
        "current_frequency",  
        "total_cpu_usage",    
        "core_utilization",   
        "total_ram_usage",    
        "available_ram",      
        "used_ram",           
        "ram_percent",        
        "total_swap",         
        "free_swap",          
        "used_swap",          
        "swap_percent",       
        "total_bytes_sent",   
        "total_bytes_received",
        "total_bytes_read",   
        "total_bytes_written",
        "gpu_usage",          
        "partitions",         
        "adapter_information",
        "dns"
    ]
    
    export_rows = []
    export_rows.append(','.join(export_data))  # Add the header row

        

    for x in dynamic_metrics: 
        
        
        core_utilization = ' | '.join(str(core).replace("'", "").replace(",", "").replace("{", "").replace("}", "") for core in x.core_utilization)
        partitions = ' | '.join(str(partition).replace("'", "").replace(",", "").replace("{", "").replace("}", "") for partition in x.partitions)
        adapters = ' | '.join(str(adapter).replace("'", "").replace(",", "").replace("{", "").replace("}", "") for adapter in x.adapter_information)
        dns_records = ' | '.join(str(dns).replace("'", "").replace(",", "").replace("{", "").replace("}", "") for dns in x.dns)

        
        print(core_utilization)
        
        row_values = [
            str(x.id),
            str(x.clientID),
            str(x.createdAt),
            str(x.boot_time),
            str(x.current_frequency),
            str(x.total_cpu_usage),
            core_utilization,
            str(x.total_ram_usage),
            str(x.available_ram),
            str(x.used_ram),
            str(x.ram_percent),
            str(x.total_swap),
            str(x.free_swap),
            str(x.used_swap),
            str(x.swap_percent),
            str(x.total_bytes_sent),
            str(x.total_bytes_received),
            str(x.total_bytes_read),
            str(x.total_bytes_written),
            str(x.gpu_usage),
            partitions,
            adapters,
            dns_records
        ]
        export_rows.append(','.join(row_values))

    csv_string = '\n'.join(export_rows)

    return csv_string
        
    