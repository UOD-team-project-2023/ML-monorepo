import {
  Group,
  Text,
  Paper,
  RingProgress,
  SimpleGrid,
  useMantineTheme,
  Title,
  Modal,
  Center,
} from "@mantine/core";
import { useEffect, useState } from "react";
import { LineGraph } from "../../components/graphs/LineGraph";
import { CoreUtilization, GpuUsage, Metric, Partition } from "../../types/metric";
import { calculateStatsRingColor } from "../../utils/calculateStatsRingColor";
import CustomAppShell from "../../components/appShell/CustomAppShell";
import { Loading } from "../../components/loading/Loading";
import { CSVLink } from "react-csv";
import { relativeTimeRounding } from "moment";

function Dashboard() {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [allMetrics, setAllMetrics] = useState<Metric[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [refetch, setRefetch] = useState(false);
  const [fetchingMetrics, setFetchingMetrics] = useState(false);
  const newestMetric = metrics[metrics.length - 1];
  const theme = useMantineTheme();
  const token = sessionStorage.getItem("token");

  useEffect(() => {
    setTimeout(() => {
      setRefetch(!refetch);
    }, 30000);
  }, [refetch]);

  useEffect(() => {
    async function fetchData() {
      setFetchingMetrics(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/metrics?client_id=${
          import.meta.env.VITE_CLIENT_ID
        }&token=${token}`
      );

      if (response.status !== 200) {
        window.location.href = "/register?error=unauthorized";
      }

      const data = await response.json();
      setMetrics(data);
    }
    fetchData();
    setFetchingMetrics(false);
  }, [refetch]);

  async function fetchAllMetrics() {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/metrics/export?client_id=${
        import.meta.env.VITE_CLIENT_ID
      }&token=${token}`
    );
    const data = await response.json();
    setShowModal(!showModal);
    setAllMetrics(data);
  }

  if (fetchingMetrics) return <Loading />;
  if (!metrics.length)
    return (
      <CustomAppShell selected={1}>
        <Loading />
      </CustomAppShell>
    );

  const totalCpuUsage =
    newestMetric.core_utilization.reduce((acc: any, curr: any) => {
      return acc + curr.utilization;
    }, 0) / newestMetric.core_utilization.length;

  const totalDiskUsage = newestMetric?.partitions.reduce((acc, cur: Partition) => {
    return acc + cur.used;
  }, 0);

  const totalDiskFree = newestMetric?.partitions.reduce((acc, cur: Partition) => {
    return acc + cur.free;
  }, 0);

  const statsRingData = [
    {
      label: "CPU usage",
      stats: `${totalCpuUsage.toFixed(2)}%`,
      progress: totalCpuUsage,
      color: calculateStatsRingColor(totalCpuUsage),
    },
    {
      label: "RAM usage",
      stats: `${(newestMetric.used_ram / 1000000000).toFixed(2)} GB`,
      progress: newestMetric.total_ram_usage,
      color: calculateStatsRingColor(newestMetric.total_ram_usage),
    },
    {
      label: "Overall Disk usage",
      stats: `${(totalDiskUsage / 1000000000).toFixed(2)} GB`,
      progress: (totalDiskUsage / totalDiskFree) * 100,
      color: calculateStatsRingColor((totalDiskUsage / totalDiskFree) * 100),
    },
  ];

  const gpuLoadMetrics = metrics.map((metric: Metric) => {
    return metric.gpu_usage.map((gpu: GpuUsage) => {
      return { ...gpu, createdAt: metric.createdAt, graphPlot: gpu.gpu_load, label: gpu.gpu_id };
    });
  });

  const gpuTemperatureMetrics = metrics.map((metric: Metric) => {
    return metric.gpu_usage.map((gpu: GpuUsage) => {
      return {
        ...gpu,
        createdAt: metric.createdAt,
        graphPlot: gpu.gpu_temperature,
        label: gpu.gpu_id,
      };
    });
  });

  const cpuCoreUtilizationMetrics = metrics.map((metric: Metric) => {
    return metric.core_utilization.map((cpu: CoreUtilization) => {
      return {
        ...cpu,
        createdAt: metric.createdAt,
        graphPlot: cpu.utilization,
        label: cpu.core,
      };
    });
  });

  const gpuMemoryMetrics = metrics.map((metric: Metric) => {
    return metric.gpu_usage.map((gpu: GpuUsage) => {
      return {
        ...gpu,
        createdAt: metric.createdAt,
        graphPlot: gpu.gpu_used_memory,
        label: gpu.gpu_id,
      };
    });
  });

  const partitionMetrics = metrics.map((metric: Metric) =>
    metric.partitions.map((partition: Partition) => {
      partition["createdAt"] = metric.createdAt;
      partition["graphPlot"] = partition.used / 1000000000;
      partition["label"] = partition.mount;
      return partition;
    })
  );

  const freeSwapMetrics = metrics.map((metric: Metric) => {
    return [
      {
        createdAt: metric.createdAt,
        graphPlot: `${(metric.free_swap / 1000000000).toFixed(2)}`,
        label: "free swap (GB)",
      },
    ];
  });
  const totalSwapMetrics = metrics.map((metric: Metric) => {
    return [
      {
        createdAt: metric.createdAt,
        graphPlot: `${(metric.total_swap / 1000000000).toFixed(2)}`,
        label: "Total swap (GB)",
      },
    ];
  });
  const usedSwapMetrics = metrics.map((metric: Metric) => {
    return [
      {
        createdAt: metric.createdAt,
        graphPlot: `${(metric.used_swap / 1000000000).toFixed(2)}`,
        label: "Used swap (GB)",
      },
    ];
  });

  const totalBytesSentMetrics = metrics.map((metric: Metric) => {
    return [
      {
        createdAt: metric.createdAt,
        graphPlot: `${(metric.total_bytes_sent / 1000000000).toFixed(2)}`,
        label: "Total bytes sent (GB)",
      },
    ];
  });
  const totalBytesRecievedMetrics = metrics.map((metric: Metric) => {
    return [
      {
        createdAt: metric.createdAt,
        graphPlot: `${(metric.total_bytes_received / 1000000000).toFixed(2)}`,
        label: "Total bytes recieved",
      },
    ];
  });
  const totalBytesReadMetrics = metrics.map((metric: Metric) => {
    return [
      {
        createdAt: metric.createdAt,
        graphPlot: `${(metric.total_bytes_read / 1000000000).toFixed(2)}`,
        label: "Total bytes read",
      },
    ];
  });
  const totalBytesWrittenMetrics = metrics.map((metric: Metric) => {
    return [
      {
        createdAt: metric.createdAt,
        graphPlot: `${(metric.total_bytes_written / 1000000000).toFixed(2)}`,
        label: "Total bytes written",
      },
    ];
  });

  const usedRamMetrics = metrics.map((metric: Metric) => {
    return [
      {
        createdAt: metric.createdAt,
        graphPlot: `${(metric.used_ram / 1000000000).toFixed(2)}`,
        label: "Total used ram",
      },
    ];
  });
  const ramUsagePercentageMetrics = metrics.map((metric: Metric) => {
    return [
      {
        createdAt: metric.createdAt,
        graphPlot: metric.total_ram_usage,
        label: "Total used ram percentage",
      },
    ];
  });
  const cpuUsagePercentageMetrics = metrics.map((metric: Metric) => {
    return [
      {
        createdAt: metric.createdAt,
        graphPlot: metric.total_cpu_usage,
        label: "Total used CPU percentage",
      },
    ];
  });

  return (
    <>
      <CustomAppShell selected={1}>
        <div>
          <button onClick={fetchAllMetrics}>Export CSV</button>
          <Modal
            opened={showModal}
            title="Download Link"
            onClose={function (): void {
              throw new Error("Function not implemented.");
            }}
          >
            <CSVLink data={allMetrics} style={{ color: theme.colors.blue[5], fontSize: 24 }}>
              Download me
            </CSVLink>
          </Modal>
        </div>
        <StatsRing data={statsRingData} />
        <Title>Swap metrics</Title>
        <SimpleGrid mt={20} mb={20} cols={3} breakpoints={[{ maxWidth: "sm", cols: 1 }]}>
          <LineGraph
            title={"Gpu usage %"}
            metrics={gpuLoadMetrics}
            maxY={1}
            amberAnnotationOptions={{
              display: true,
              yMin: 0.6,
              yMax: 0.8,
            }}
            redAnnotationOptions={{
              display: true,
              yMin: 0.8,
              yMax: 1,
            }}
          />
          <LineGraph title={"Gpu memory (MB)"} metrics={gpuMemoryMetrics} />
          <LineGraph
            title={"Gpu temperature"}
            metrics={gpuTemperatureMetrics}
            amberAnnotationOptions={{
              display: true,
              yMin: 80,
              yMax: 70,
            }}
            redAnnotationOptions={{
              display: true,
              yMin: 80,
              yMax: 100,
            }}
          />
        </SimpleGrid>
        <Title>Storage metrics</Title>
        <SimpleGrid mt={20} mb={20} cols={3} breakpoints={[{ maxWidth: "sm", cols: 1 }]}>
          <LineGraph title={"Total bytes sent"} metrics={totalBytesSentMetrics} />
          <LineGraph title={"Total bytes recieved"} metrics={totalBytesRecievedMetrics} />
          <LineGraph title={"Total bytes read"} metrics={totalBytesReadMetrics} />
          <LineGraph title={"Total bytes written"} metrics={totalBytesWrittenMetrics} />
          <LineGraph title={"Storage usage"} metrics={partitionMetrics} />
        </SimpleGrid>
        <Title>Memory metrics</Title>
        <SimpleGrid mt={20} mb={20} cols={3} breakpoints={[{ maxWidth: "sm", cols: 1 }]}>
          <LineGraph title={"Total swap"} metrics={totalSwapMetrics} />
          <LineGraph title={"Used swap"} metrics={usedSwapMetrics} />
          <LineGraph title={"Free swap"} metrics={freeSwapMetrics} />
          <LineGraph title={"Used ram"} metrics={usedRamMetrics} />
          <LineGraph
            title={"Used ram %"}
            amberAnnotationOptions={{
              display: true,
              yMin: 80,
              yMax: 70,
            }}
            redAnnotationOptions={{
              display: true,
              yMin: 80,
              yMax: 100,
            }}
            metrics={ramUsagePercentageMetrics}
          />
        </SimpleGrid>
        <Title>Cpu metrics</Title>
        <SimpleGrid mt={20} mb={20} cols={2} breakpoints={[{ maxWidth: "sm", cols: 1 }]}>
          <LineGraph title={"Cpu core usage"} metrics={cpuCoreUtilizationMetrics} maxY={100} />
          <LineGraph
            title={"Cpu usage"}
            metrics={cpuUsagePercentageMetrics}
            maxY={100}
            amberAnnotationOptions={{
              display: true,
              yMin: 80,
              yMax: 70,
            }}
            redAnnotationOptions={{
              display: true,
              yMin: 80,
              yMax: 100,
            }}
          />
        </SimpleGrid>
      </CustomAppShell>
    </>
  );
}

interface StatsRingProps {
  data: {
    label: string;
    stats: string;
    progress: number;
    color: string;
  }[];
}

function StatsRing({ data }: StatsRingProps) {
  const theme = useMantineTheme();
  const stats = data.map((stat) => {
    return (
      <Paper
        sx={{ backgroundColor: theme.colors.dark[6] }}
        shadow={"lg"}
        radius="md"
        p="md"
        key={stat.label}
      >
        <Group>
          <RingProgress
            size={80}
            roundCaps
            thickness={8}
            sections={[{ value: stat.progress, color: stat.color }]}
          />
          <div>
            <Text color="dimmed" size="xs" transform="uppercase" weight={600}>
              {stat.label}
            </Text>
            <Text weight={600} size="xl">
              {stat.stats}
            </Text>
          </div>
        </Group>
      </Paper>
    );
  });
  return (
    <SimpleGrid cols={3} breakpoints={[{ maxWidth: "sm", cols: 1 }]}>
      {stats}
    </SimpleGrid>
  );
}

export default Dashboard;
