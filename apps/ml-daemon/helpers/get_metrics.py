import psutil
import platform
from datetime import datetime
import GPUtil
import cpuinfo
import json
import dns.resolver
import time#######################################


def get_gpu_names():
    gpus = GPUtil.getGPUs()
    list_gpus = []
    for gpu in gpus:
        list_gpus.append({
            "gpu_name":gpu.name, 
            "gpu_uuid":gpu.uuid
            })
    return list_gpus


def get_gpu_stats():
    gpus = GPUtil.getGPUs()
    list_gpus = []
    for gpu in gpus:
        list_gpus.append({
            "gpu_id":gpu.id, 
            "gpu_load":gpu.load, 
            "gpu_free_memory":gpu.memoryFree, 
            "gpu_used_memory":gpu.memoryUsed,
            "gpu_total_memory":gpu.memoryTotal, 
            "gpu_temperature":gpu.temperature, 
            "gpu_uuid":gpu.uuid
        })
    return list_gpus

def get_core_utilization():
    core_usage = []
    for i, percentage in enumerate(psutil.cpu_percent(percpu=True, interval=1)):
        core_usage.append({
            "core":i, 
            "utilization":percentage
            })
    return core_usage

def get_partition_information():
    partitions = psutil.disk_partitions()
    partition_info = []
    for partition in partitions:
        try:
            partition_usage = psutil.disk_usage(partition.mountpoint)
            partition_usage_total = partition_usage.total
            partition_usage_used = partition_usage.used
            partition_usage_free = partition_usage.free
            partition_usage_percent = partition_usage.percent
        except PermissionError:
            partition_usage_total = None
            partition_usage_used = None
            partition_usage_free = None
            partition_usage_percent = None
            continue
        partition_info.append({
            "device":partition.device,
            "mount":partition.mountpoint,
            "filesystem":partition.fstype,
            "total_size":partition_usage_total, ##these should only be added if get partition works
            "used":partition_usage_used,
            "free":partition_usage_free,
            "free_percent":partition_usage_percent,
        })
    return partition_info

def get_network_information():
    interface_list = []
    for interface in psutil.net_if_addrs().items():

        mac = "Not Available"
        ipv4_addr = "Not Available"
        ipv4_netmask = "Not Available"
        ipv6 = "Not Available"

        name = interface[0]
        for networkstack in interface[1]:
            
            if str(networkstack.family) == "AddressFamily.AF_LINK" or str(networkstack.family) == "AddressFamily.AF_PACKET":
                mac = networkstack.address

            if str(networkstack.family) == "AddressFamily.AF_INET":
                ipv4_addr = networkstack.address
                ipv4_netmask = networkstack.netmask
                
            if str(networkstack.family) == "AddressFamily.AF_INET6":
                ipv6 = networkstack.address
    
        interface_list.append({
            "if_name":name,
            "ipv4_addr":ipv4_addr,
            "ipv4_netmask":ipv4_netmask,
            "ipv6":ipv6,
            "mac":mac,
        })  
    return interface_list

def get_dns_information():
    dns_servers = []
    for nameserver in dns.resolver.get_default_resolver().nameservers:
        dns_servers.append({
            "dns_server": nameserver
            })
    return dns_servers

def get_static_information_json():

    uname = platform.uname() # related to OS information
    my_cpuinfo = cpuinfo.get_cpu_info()
    cpufreq = psutil.cpu_freq()
    svmem = psutil.virtual_memory()



    sysinfo = {
        "system": uname.system,
        "host_name": uname.node,
        "release": uname.release,
        "version": uname.version,
        "cpu_type": uname.machine,
        "cpu_name": my_cpuinfo.get("brand_raw", None),
        "cpu_family": uname.processor,
        "physical_cores": psutil.cpu_count(logical=False),
        "logical_cores": psutil.cpu_count(logical=True),
        "max_frequency": cpufreq.max,
        "min_frequency": cpufreq.min,
        "total_ram": svmem.total,
        "gpus": get_gpu_names(),
    }

    json_object = json.dumps(sysinfo, indent = 4) 
    return json_object


def get_dynamic_information_json():
    cpufreq = psutil.cpu_freq()
    swap = psutil.swap_memory()
    boot_time_timestamp = psutil.boot_time()
    bt = datetime.fromtimestamp(boot_time_timestamp)
    net_io = psutil.net_io_counters()# get network IO statistics since boot
    disk_io = psutil.disk_io_counters()# get disk IO statistics since boot
    svmem = psutil.virtual_memory()

    dynamicinfo = {
        "boot_time": f"{bt.year}/{bt.month}/{bt.day} {bt.hour}:{bt.minute}:{bt.second}",
        "current_frequency": cpufreq.current,
        "total_cpu_usage": psutil.cpu_percent(),
        "core_utilization": get_core_utilization(),
        "total_ram_usage": svmem.percent,
        "available_ram": svmem.available,
        "used_ram": svmem.used,
        "ram_percent": svmem.percent,
        "total_swap": swap.total,
        "free_swap": swap.free,
        "used_swap": swap.used,
        "swap_percent": swap.percent,
        "total_bytes_sent": net_io.bytes_sent,
        "total_bytes_received": net_io.bytes_recv,
        "total_bytes_read": disk_io.read_bytes,
        "total_bytes_written": disk_io.write_bytes,
        "gpu_usage": get_gpu_stats(),
        "partitions": get_partition_information(),
        "adapter_information": get_network_information(),
        "dns": get_dns_information(),
    }

    json_object = json.dumps(dynamicinfo, indent = 4) 
    return json_object


def get_host_name():
    uname = platform.uname() # related to OS information
    return uname.node
