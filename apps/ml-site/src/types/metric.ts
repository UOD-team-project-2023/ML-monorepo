export interface AdapterInformation {
  mac: string;
  ipv6: string;
  if_name: string; // interface name
  ipv4_addr: string;
  ipv4_netmask: string;
}

export interface CoreUtilization {
  core: number;
  utilization: number;
}

export interface DNS {
  dns_server: string;
}

export interface GpuUsage {
  gpu_free_memory: number;
  gpu_id: number;
  gpu_load: number;
  gpu_temperature: number;
  gpu_total_memory: number;
  gpu_used_memory: number;
  gpu_uuid: string;
}

export interface Partition {
  createdAt: string | undefined; // date string
  device: string;
  filesystem: string;
  free: number;
  free_percent: number;
  mount: string;
  total_size: number;
  used: number;
  graphPlot?: number;
  label?: string;
}
export interface Metric {
  adapter_information: AdapterInformation[];
  available_ram: number;
  boot_time: string; // date string
  client: null;
  clientID: string;
  core_utilization: CoreUtilization[];
  createdAt: string; // date string
  current_frequency: number;
  dns: DNS[];
  free_swap: number;
  gpu_usage: GpuUsage[];
  id: number;
  partitions: Partition[];
  ram_percent: number;
  swap_percent: number;
  total_bytes_read: number;
  total_bytes_received: number;
  total_bytes_sent: number;
  total_bytes_written: number;
  total_cpu_usage: number;
  total_ram_usage: number;
  total_swap: number;
  used_ram: number;
  used_swap: number;
}
