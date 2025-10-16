"use client";

import * as React from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Cell } from "recharts";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetchAllDevicesDataAggregation, fetchDevices } from "@/lib/network";
import {
  Device,
  DeviceAggregationData,
  ChartDataPoint,
  TimePeriodOption,
} from "@/lib/types";
import RingLoader from "react-spinners/RingLoader";

export const description = "An interactive bar chart showing device uptime";

const UptimeBarChart = ({ networkId }: { networkId?: string | number }) => {
  const isMobile = useIsMobile();

  const timePeriodOptions: TimePeriodOption[] = [
    { label: "5 minutes", value: "5m" },
    { label: "15 minutes", value: "15m" },
    { label: "60 minutes", value: "60m" },
    { label: "6 hours", value: "6h" },
    { label: "12 hours", value: "12h" },
    { label: "24 hours", value: "24h" },
    { label: "7 days", value: "7d" },
    { label: "30 days", value: "30d" },
    { label: "90 days", value: "90d" },
    { label: "365 days", value: "365d" },
  ];

  const [timePeriod, setTimePeriod] = React.useState(
    timePeriodOptions[2].value
  ); // Default to 60m
  const [aggregationData, setAggregationData] = React.useState<
    DeviceAggregationData[]
  >([]);
  const [devices, setDevices] = React.useState<Device[]>([]);
  const [loading, setLoading] = React.useState(false);

  const convertPeriodToInterval = (period: string): string => {
    switch (period) {
      case "5m":
        return "5 minutes";
      case "15m":
        return "15 minutes";
      case "60m":
        return "60 minutes";
      case "6h":
        return "6 hours";
      case "12h":
        return "12 hours";
      case "24h":
        return "24 hours";
      case "7d":
        return "7 days";
      case "30d":
        return "30 days";
      case "90d":
        return "90 days";
      case "365d":
        return "365 days";
      default:
        return period;
    }
  };

  const loadData = React.useCallback(async () => {
    if (!networkId) return;

    setLoading(true);
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const periodInterval = convertPeriodToInterval(timePeriod);
      const [aggData, devicesData] = await Promise.all([
        fetchAllDevicesDataAggregation(token, periodInterval, networkId),
        fetchDevices(token, networkId),
      ]);

      if (devicesData.length === 0) {
        setAggregationData([]);
        setDevices([]);
        setLoading(false);
        return;
      }

      setAggregationData(aggData);
      setDevices(devicesData);
    } catch (error) {
      console.error("Error fetching data:", error);
      setAggregationData([]);
      setDevices([]);
    }
    setLoading(false);
  }, [timePeriod, networkId]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const chartData: ChartDataPoint[] = React.useMemo(() => {
    if (!aggregationData || aggregationData.length === 0) return [];

    // Create a mapping from host_id to host name
    const hostMap: Record<number, string> = {};
    if (devices && devices.length > 0) {
      devices.forEach((device) => {
        hostMap[device.id] = device.name || `Host ${device.id}`;
      });
    }

    // Map each aggregation record to the chart data format
    return aggregationData.map((item) => ({
      name: hostMap[item.host_id] || `Host ${item.host_id}`,
      uptime_percentage: item.uptime_percentage,
      total_pings: item.total_pings,
      host_id: item.host_id,
    }));
  }, [aggregationData, devices]);

  const getBarColor = (uptimePercentage: number): string => {
    if (uptimePercentage > 80) {
      return "#22c55e"; // Green
    } else if (uptimePercentage > 50) {
      return "#eab308"; // Yellow
    } else {
      return "#ef4444"; // Red
    }
  };

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Device Uptime Overview</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Uptime percentage for all devices in the selected network.
          </span>
        </CardDescription>
        <CardAction className="flex flex-col gap-2 sm:flex-row sm:gap-4">
          <Select value={timePeriod} onValueChange={setTimePeriod}>
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate"
              size="sm"
              aria-label="Select time period"
            >
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent className="rounded-xl bg-card border border-border">
              {timePeriodOptions.map((opt) => (
                <SelectItem
                  key={opt.value}
                  value={opt.value}
                  className="rounded-lg"
                >
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6 relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <RingLoader color="var(--color-logo-orange)" size={48} />
          </div>
        )}
        <ChartContainer
          config={{
            uptime_percentage: {
              label: "Uptime %",
              color: "#22c55e",
            },
          }}
          className="aspect-auto h-[400px] w-full"
        >
          <BarChart data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                return value && value.length > 10
                  ? `${value.substring(0, 10)}...`
                  : value;
              }}
            />
            <YAxis
              domain={[0, 100]}
              tickLine={false}
              axisLine={false}
              tickFormatter={(tick) => `${tick}%`}
            />
            <ChartTooltip
              cursor={false}
              defaultIndex={isMobile ? -1 : 10}
              content={
                <ChartTooltipContent
                  labelKey="name"
                  nameKey="uptime_percentage"
                  indicator="dot"
                />
              }
            />
            <Bar dataKey="uptime_percentage" name="Uptime %">
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={getBarColor(entry.uptime_percentage)}
                />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
        {loading && <div className="text-center text-xs mt-2">Loading...</div>}
        {!loading && devices.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground text-sm">
              No devices found in this network.
            </p>
          </div>
        )}
        {!loading && devices.length > 0 && !chartData.length && (
          <div className="text-center text-xs mt-2">No data available.</div>
        )}
      </CardContent>
    </Card>
  );
};

export default UptimeBarChart;
