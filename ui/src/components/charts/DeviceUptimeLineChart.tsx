"use client";

import * as React from "react";
import { Line, LineChart, CartesianGrid, XAxis, YAxis } from "recharts";
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
import { fetchDevices, fetchDeviceUptimeData } from "@/lib/network";
import { Device, DeviceUptime, TimePeriodOption } from "@/lib/types";
import RingLoader from "react-spinners/RingLoader";

export const description =
  "An interactive line chart showing device uptime over time";

const DeviceUptimeLineChart = ({
  networkId,
}: {
  networkId?: string | number;
}) => {
  const isMobile = useIsMobile();

  const timePeriodOptions: TimePeriodOption[] = [
    { label: "6 Hours", value: "6h" },
    { label: "12 Hours", value: "12h" },
    { label: "24 Hours", value: "24h" },
    { label: "7 Days", value: "7d" },
  ];

  const [selectedDevice, setSelectedDevice] = React.useState<string>("");
  const [timePeriod, setTimePeriod] = React.useState(
    timePeriodOptions[0].value
  );
  const [data, setData] = React.useState<DeviceUptime[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [devices, setDevices] = React.useState<Device[]>([]);

  const convertPeriodToInterval = (period: string): number => {
    if (period.endsWith("m")) {
      return parseInt(period.slice(0, -1));
    } else if (period.endsWith("h")) {
      return parseInt(period.slice(0, -1)) * 60;
    } else if (period.endsWith("d")) {
      return parseInt(period.slice(0, -1)) * 24 * 60;
    }
    return 60; // default to 60 minutes
  };

  // Combined effect to handle devices and uptime data
  React.useEffect(() => {
    if (!networkId) return;

    const loadData = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      setIsLoading(true);
      try {
        // First, fetch devices for the network
        const devicesData = await fetchDevices(token, networkId);
        setDevices(devicesData);

        if (devicesData.length === 0) {
          // No devices in this network
          setSelectedDevice("");
          setData([]);
          setIsLoading(false);
          return;
        }

        // Check if current selected device exists in the new network
        const deviceExists = devicesData.some(
          (device) => String(device.id) === selectedDevice
        );

        if (!deviceExists) {
          // Reset to first device if current selection doesn't exist in new network
          setSelectedDevice(String(devicesData[0].id));
          setIsLoading(false);
          return; // Exit here, the effect will run again with the new selectedDevice
        }

        // Fetch uptime data for the selected device
        const periodInterval = convertPeriodToInterval(timePeriod);
        const result = await fetchDeviceUptimeData(
          token,
          selectedDevice,
          periodInterval,
          networkId
        );
        setData(result);
      } catch (error) {
        console.error("Error fetching data:", error);
        setDevices([]);
        setSelectedDevice("");
        setData([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [networkId, selectedDevice, timePeriod]);

  const chartData = data.map((item) => ({
    date: item.bucket,
    uptime: item.uptime_percentage,
    total_pings: item.total_pings,
  }));

  const getDotColor = (uptimePercentage: number): string => {
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
        <CardTitle>Device Uptime Timeline</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Uptime percentage over time for the selected device.
          </span>
        </CardDescription>
        <CardAction className="flex flex-col gap-2 sm:flex-row sm:gap-4">
          <Select value={selectedDevice} onValueChange={setSelectedDevice}>
            <SelectTrigger
              className="flex w-48 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate"
              size="sm"
              aria-label="Select device"
              disabled={!devices.length}
            >
              <SelectValue placeholder="Select device" />
            </SelectTrigger>
            <SelectContent className="rounded-xl bg-card border border-border">
              {devices.map((device) => (
                <SelectItem
                  key={device.id}
                  value={String(device.id)}
                  className="rounded-lg"
                >
                  {device.name || `Device ${device.id}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

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
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <RingLoader color="var(--color-logo-orange)" size={48} />
          </div>
        )}
        <ChartContainer
          config={{
            uptime: { label: "Uptime %", color: "#22c55e" },
          }}
          className="aspect-auto h-[400px] w-full"
        >
          <LineChart data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                });
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
                  labelFormatter={(value) => {
                    const date = new Date(value);
                    return date.toLocaleString(undefined, {
                      hour: "2-digit",
                      minute: "2-digit",
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    });
                  }}
                  indicator="dot"
                />
              }
            />
            <Line
              type="monotone"
              dataKey="uptime"
              name="Uptime %"
              stroke="hsl(var(--chart-1))"
              strokeWidth={2}
              dot={(props) => {
                const { cx, cy, payload, index } = props;
                if (!cx || !cy) return <></>;
                return (
                  <circle
                    key={`dot-${index}`}
                    cx={cx}
                    cy={cy}
                    r={4}
                    stroke={getDotColor(payload.uptime)}
                    fill={getDotColor(payload.uptime)}
                  />
                );
              }}
            />
          </LineChart>
        </ChartContainer>
        {isLoading && (
          <div className="text-center text-xs mt-2">Loading...</div>
        )}
        {!isLoading && devices.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground text-sm">
              No devices found in this network.
            </p>
          </div>
        )}
        {!isLoading && devices.length > 0 && !chartData.length && (
          <div className="text-center text-xs mt-2">No data available.</div>
        )}
      </CardContent>
    </Card>
  );
};

export default DeviceUptimeLineChart;
