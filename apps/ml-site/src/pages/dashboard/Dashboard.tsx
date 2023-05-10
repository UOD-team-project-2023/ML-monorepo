import {
  Group,
  Text,
  Paper,
  RingProgress,
  SimpleGrid,
  useMantineTheme,
  Title,
  Drawer,
  Button,
  ScrollArea,
  List,
  Flex,
  rem,
} from "@mantine/core";
import { useEffect, useState } from "react";
import { LineGraph } from "../../components/graphs/LineGraph";
import { CoreUtilization, DynamicMetric, GpuUsage, Metrics, Partition } from "../../types/metric";
import { calculateStatsRingColor } from "../../utils/calculateStatsRingColor";
import CustomAppShell from "../../components/appShell/CustomAppShell";
import { Loading } from "../../components/loading/Loading";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";

function Dashboard() {
  const [metrics, setMetrics] = useState<Metrics | undefined>(undefined);
  const [refetch, setRefetch] = useState(false);
  const [fetchingMetrics, setFetchingMetrics] = useState(false);
  const [maxCols, setMaxCols] = useState(3);
  const [refetchGroups, setRefetchGroups] = useState(false);
  const [groups, setGroups] = useState<any[]>([]);
  const [selectedClientId, setSelectedClientId] = useState("");

  useEffect(() => {
    setRefetch(!refetch);
    notifications.show({
      title: "Metrics updated",
      message: "Metrics have been updated",
      color: "green",
    });
  }, [selectedClientId]);

  const [opened, { open, close }] = useDisclosure(false);

  const token = sessionStorage.getItem("token");

  const mediaQuery = useMediaQuery("(max-width: 80em) and (min-width: 48em)");

  useEffect(() => {
    if (mediaQuery) return setMaxCols(1);
    setMaxCols(3);
  }, [mediaQuery]);

  useEffect(() => {
    setTimeout(() => {
      setRefetch(!refetch);
    }, 30000);
  }, [refetch]);

  useEffect(() => {
    async function fetchData() {
      setFetchingMetrics(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/metrics?token=${token}&client_id=${selectedClientId}`
      );

      if (response.status !== 200) {
        return (window.location.href = "/register?error=unauthorized");
      }

      const data = await response.json();
      setMetrics(data);
      setSelectedClientId(data[data.length - 1].clientID);
    }
    fetchData();
    setFetchingMetrics(false);
  }, [refetch]);

  useEffect(() => {
    async function fetchData() {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/groups`);

      if (response.status !== 200) {
        window.location.href = "/register?error=unauthorized";
      }

      const data = await response.json();
      setGroups(data.groups);
    }
    fetchData();
    setRefetchGroups(false);
  }, [refetchGroups]);

  if (fetchingMetrics) return <Loading />;
  if (!metrics)
    return (
      <CustomAppShell selected={1}>
        <Loading />
      </CustomAppShell>
    );

  const newestMetric = metrics.dynamic[metrics.dynamic.length - 1];

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

  const gpuLoadMetrics = metrics.dynamic.map((metric: DynamicMetric) => {
    return metric.gpu_usage.map((gpu: GpuUsage) => {
      return { ...gpu, createdAt: metric.createdAt, graphPlot: gpu.gpu_load, label: gpu.gpu_id };
    });
  });

  const gpuTemperatureMetrics = metrics.dynamic.map((metric: DynamicMetric) => {
    return metric.gpu_usage.map((gpu: GpuUsage) => {
      return {
        ...gpu,
        createdAt: metric.createdAt,
        graphPlot: gpu.gpu_temperature,
        label: gpu.gpu_id,
      };
    });
  });

  const cpuCoreUtilizationMetrics = metrics.dynamic.map((metric: DynamicMetric) => {
    return metric.core_utilization.map((cpu: CoreUtilization) => {
      return {
        ...cpu,
        createdAt: metric.createdAt,
        graphPlot: cpu.utilization,
        label: cpu.core,
      };
    });
  });

  const gpuMemoryMetrics = metrics.dynamic.map((metric: DynamicMetric) => {
    return metric.gpu_usage.map((gpu: GpuUsage) => {
      return {
        ...gpu,
        createdAt: metric.createdAt,
        graphPlot: gpu.gpu_used_memory,
        label: gpu.gpu_id,
      };
    });
  });

  const partitionMetrics = metrics.dynamic.map((metric: DynamicMetric) =>
    metric.partitions.map((partition: Partition) => {
      partition["createdAt"] = metric.createdAt;
      partition["graphPlot"] = partition.used / 1000000000;
      partition["label"] = partition.mount;
      return partition;
    })
  );

  const freeSwapMetrics = metrics.dynamic.map((metric: DynamicMetric) => {
    return [
      {
        createdAt: metric.createdAt,
        graphPlot: `${(metric.free_swap / 1000000000).toFixed(2)}`,
        label: "free swap (GB)",
      },
    ];
  });
  const totalSwapMetrics = metrics.dynamic.map((metric: DynamicMetric) => {
    return [
      {
        createdAt: metric.createdAt,
        graphPlot: `${(metric.total_swap / 1000000000).toFixed(2)}`,
        label: "Total swap (GB)",
      },
    ];
  });
  const usedSwapMetrics = metrics.dynamic.map((metric: DynamicMetric) => {
    return [
      {
        createdAt: metric.createdAt,
        graphPlot: `${(metric.used_swap / 1000000000).toFixed(2)}`,
        label: "Used swap (GB)",
      },
    ];
  });

  const totalBytesSentMetrics = metrics.dynamic.map((metric: DynamicMetric) => {
    return [
      {
        createdAt: metric.createdAt,
        graphPlot: `${(metric.total_bytes_sent / 1000000000).toFixed(2)}`,
        label: "Total bytes sent (GB)",
      },
    ];
  });
  const totalBytesRecievedMetrics = metrics.dynamic.map((metric: DynamicMetric) => {
    return [
      {
        createdAt: metric.createdAt,
        graphPlot: `${(metric.total_bytes_received / 1000000000).toFixed(2)}`,
        label: "Total bytes recieved",
      },
    ];
  });
  const totalBytesReadMetrics = metrics.dynamic.map((metric: DynamicMetric) => {
    return [
      {
        createdAt: metric.createdAt,
        graphPlot: `${(metric.total_bytes_read / 1000000000).toFixed(2)}`,
        label: "Total bytes read",
      },
    ];
  });
  const totalBytesWrittenMetrics = metrics.dynamic.map((metric: DynamicMetric) => {
    return [
      {
        createdAt: metric.createdAt,
        graphPlot: `${(metric.total_bytes_written / 1000000000).toFixed(2)}`,
        label: "Total bytes written",
      },
    ];
  });

  const usedRamMetrics = metrics.dynamic.map((metric: DynamicMetric) => {
    return [
      {
        createdAt: metric.createdAt,
        graphPlot: `${(metric.used_ram / 1000000000).toFixed(2)}`,
        label: "Total used ram",
      },
    ];
  });
  const ramUsagePercentageMetrics = metrics.dynamic.map((metric: DynamicMetric) => {
    return [
      {
        createdAt: metric.createdAt,
        graphPlot: metric.total_ram_usage,
        label: "Total used ram percentage",
      },
    ];
  });
  const cpuUsagePercentageMetrics = metrics.dynamic.map((metric: DynamicMetric) => {
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
        <Title>{metrics.static.host_name}</Title>
        <Group
          style={{
            position: "fixed",
            right: 17,
            top: 10,
            zIndex: 20000,
          }}
        >
          <Button color={!opened ? "blue" : "red"} onClick={!opened ? open : close}>
            {opened ? "Close client list" : "Open clients list"}
          </Button>
        </Group>
        <Drawer
          size={rem(700)}
          title={"Clients list"}
          position="right"
          opened={opened}
          onClose={close}
          scrollAreaComponent={ScrollArea.Autosize}
        >
          {groups.map((group: any) => {
            return (
              <List listStyleType="disc">
                <List.Item>
                  <Title>{group.name}</Title>
                </List.Item>
                <Flex direction={"column"} gap={7}>
                  {group.clients.map((client: any) => {
                    return (
                      <List withPadding>
                        <List.Item>
                          <Button onClick={() => setSelectedClientId(client.clientID)}>
                            {client.host_name}
                          </Button>
                        </List.Item>
                      </List>
                    );
                  })}
                </Flex>
              </List>
            );
          })}

          <Button component={"a"} href="/groups" mt={"100%"}>
            Group clients
          </Button>
        </Drawer>
        <StatsRing data={statsRingData} />
        <Title>Swap metrics</Title>
        <SimpleGrid mt={20} mb={20} cols={maxCols} breakpoints={[{ maxWidth: "sm", cols: 1 }]}>
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
        <SimpleGrid mt={20} mb={20} cols={maxCols} breakpoints={[{ maxWidth: "sm", cols: 1 }]}>
          <LineGraph title={"Total bytes sent (GB)"} metrics={totalBytesSentMetrics} />
          <LineGraph title={"Total bytes recieved (GB)"} metrics={totalBytesRecievedMetrics} />
          <LineGraph title={"Total bytes read (GB)"} metrics={totalBytesReadMetrics} />
          <LineGraph title={"Total bytes written (GB)"} metrics={totalBytesWrittenMetrics} />
          <LineGraph title={"Storage usage (GB)"} metrics={partitionMetrics} />
        </SimpleGrid>
        <Title>Memory metrics</Title>
        <SimpleGrid mt={20} mb={20} cols={maxCols} breakpoints={[{ maxWidth: "sm", cols: 1 }]}>
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
