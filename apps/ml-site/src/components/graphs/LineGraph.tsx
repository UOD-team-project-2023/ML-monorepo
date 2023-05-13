import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  TimeScale,
  Filler,
  LogarithmicScale,
  ChartOptions,
  ChartData,
} from "chart.js";
import { Line } from "react-chartjs-2";
import "chartjs-adapter-moment";
import { Paper, useMantineTheme, Title, Button, Center, Box, Flex } from "@mantine/core";
import { DynamicMetric } from "../../types/metric";
import { getGraphColor } from "../../utils/getGraphColor";
import Zoom from "chartjs-plugin-zoom";
import { useRef } from "react";
import annotationPlugin from "chartjs-plugin-annotation";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  TimeScale,
  Tooltip,
  Legend,
  Filler,
  LogarithmicScale,
  Zoom,
  annotationPlugin
);

interface CustomAnnotationOptions {
  display: boolean;
  title?: string;
  yMin?: number;
  yMax?: number;
}
interface LineGraphProps {
  metrics: any;
  title: string;
  large?: boolean;
  maxX?: number;
  maxY?: number;
  amberAnnotationOptions?: CustomAnnotationOptions;
  redAnnotationOptions?: CustomAnnotationOptions;
}

export function LineGraph({
  metrics,
  title,
  large,
  maxX,
  maxY,
  amberAnnotationOptions,
  redAnnotationOptions,
}: LineGraphProps) {
  const options: ChartOptions<"line"> = {
    responsive: true,
    plugins: {
      annotation: {
        annotations: {
          amber: {
            display: amberAnnotationOptions?.display ?? false,
            type: "box",
            xMin: 0,
            xMax: 1000,
            yMin: amberAnnotationOptions?.yMin,
            yMax: amberAnnotationOptions?.yMax,
            backgroundColor: "rgba(255, 153, 0, 0.4)",
            label: {
              display: amberAnnotationOptions?.display ?? false,
              content: amberAnnotationOptions?.title
                ? amberAnnotationOptions.title
                : "Warning zone",
              position: "start",
              color: "white",
              font: {
                size: 12,
              },
            },
          },
          red: {
            display: amberAnnotationOptions?.display ?? false,
            type: "box",
            xMin: 0,
            xMax: 1000,
            yMin: redAnnotationOptions?.yMin,
            yMax: redAnnotationOptions?.yMax,
            backgroundColor: "rgba(255, 99, 132, 0.25)",
            label: {
              display: redAnnotationOptions?.display ?? false,
              content: redAnnotationOptions?.title ? redAnnotationOptions.title : "Danger zone",
              position: "start",
              color: "white",
              font: {
                size: 12,
              },
            },
          },
        },
      },
      zoom: {
        pan: {
          enabled: true,
          mode: "xy",
        },
        zoom: {
          wheel: {
            enabled: true,
          },
          mode: "xy",
        },
      },
    },
    transitions: {
      zoom: {
        animation: {
          duration: 1000,
          easing: "easeInOutCubic",
        },
      },
    },
    scales: {
      x: {
        max: maxX,
        ticks: {
          maxTicksLimit: 100,
          autoSkip: true,
          color: "rgba(255, 255, 255, 0.7)",
        },
      },
      y: {
        min: 0,
        max: maxY,
        ticks: {
          autoSkip: true,
          color: "rgba(255, 255, 255, 0.7)",
        },
      },
    },
  };

  const chartRef: any = useRef();

  const theme = useMantineTheme();
  let check = true;

  const sortedMetrics = metrics?.map((metric: DynamicMetric[]) =>
    metric.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
  );

  const labels = sortedMetrics?.map((metric: DynamicMetric[]) => {
    if (!metric || metric.length === 0) {
      check = false;
      return check;
    }
    const date = new Date(metric[0].createdAt);
    const formattedDate = date.toLocaleTimeString();

    return formattedDate;
  });

  if (!check) return <></>;

  if (!metrics) return <h1>No metrics exist for this graph</h1>;
  const datasetNames = metrics[0]?.map((metric: any) => metric.label);

  const datasets = datasetNames?.map((datasetName: string, index: number) => {
    const data = metrics.map((metric: any) => {
      const partition = metric.find((m: any) => m.label === datasetName);
      return partition.graphPlot;
    });
    const graphColor = getGraphColor(index);
    return {
      label: datasetName,
      data,
      backgroundColor: graphColor,
      borderColor: getGraphColor(index),
    };
  });

  const data: ChartData<"line"> = {
    labels,
    datasets: datasets,
  };

  if (!data.datasets) return <></>;

  return (
    <>
      <Box
        style={{
          backgroundColor: theme.colors.dark[6],
          borderRadius: theme.radius.md,
          padding: theme.spacing.md,
          width: "100%",
        }}
      >
        {large ? (
          <Paper sx={{ backgroundColor: theme.colors.dark[6] }}>
            <Line data={data} options={options} />
          </Paper>
        ) : (
          <>
            <Center>
              <Title underline size={15}>
                {title}
              </Title>
            </Center>
            <Flex justify={"space-between"}>
              <Button
                onClick={() => {
                  const chart = chartRef.current;
                  chart?.resetZoom();
                }}
              >
                Reset zoom
              </Button>
            </Flex>
            <Line ref={chartRef} data={data} options={options} />
          </>
        )}
      </Box>
    </>
  );
}
