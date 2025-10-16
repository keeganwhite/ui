"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
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
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  fetchNetworks,
  fetchDevices,
  fetchDeviceUptimeData,
} from "@/lib/network";
import { Network, Device, DeviceUptime } from "@/lib/types";
import RingLoader from "react-spinners/RingLoader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const description = "An interactive area chart";

const UptimeAreaChart = () => {
  const isMobile = useIsMobile();
  // period options in minutes, all unique
  const periodOptions = [
    { label: "Last hour", value: "60" }, // 60 min
    { label: "Last 6 hours", value: "360" }, // 6 hours * 60 min
    { label: "Last 1 day", value: "1440" }, // 24 hours * 60 min
  ];
  const [period, setPeriod] = React.useState(periodOptions[0].value);
  const [networks, setNetworks] = React.useState<Network[]>([]);
  const [devices, setDevices] = React.useState<Device[]>([]);
  const [selectedNetwork, setSelectedNetwork] = React.useState<
    string | undefined
  >(undefined);
  const [selectedDevice, setSelectedDevice] = React.useState<
    string | undefined
  >(undefined);
  const [uptimeData, setUptimeData] = React.useState<DeviceUptime[]>([]);
  const [loading, setLoading] = React.useState(false);

  // Fetch networks on mount and set first as default
  React.useEffect(() => {
    setLoading(true);

    const loadData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No token found");
        const networks = await fetchNetworks(token);
        setNetworks(networks);
        if (networks.length > 0) {
          const firstNetwork = networks[0];
          setSelectedNetwork(String(firstNetwork.id));
          const devices = await fetchDevices(token, firstNetwork.id);
          setDevices(devices);
          if (devices.length > 0) {
            setSelectedDevice(String(devices[0].id));
          }
        }

        setLoading(false);
      } catch (error) {
        setLoading(false);
        setNetworks([]);
        setDevices([]);
        setSelectedNetwork(undefined);
        setSelectedDevice(undefined);
        setUptimeData([]);
        console.error(
          "[chart-area-interactive] Error fetching networks",
          error
        );
      }
    };
    loadData();
  }, []);
  React.useEffect(() => {
    setLoading(true);

    const loadData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token || !selectedNetwork) return;
        const devices = await fetchDevices(token, selectedNetwork);
        setDevices(devices);
        if (devices.length > 0) {
          setSelectedDevice(String(devices[0].id));
        } else {
          setSelectedDevice(undefined);
          setUptimeData([]);
        }
        setLoading(false);
      } catch (error) {
        setLoading(false);
        setNetworks([]);
        setDevices([]);
        setSelectedNetwork(undefined);
        setSelectedDevice(undefined);
        setUptimeData([]);
        console.error(
          "[chart-area-interactive] Error fetching networks",
          error
        );
      }
    };
    loadData();
  }, [selectedNetwork]);
  //selectedNetwork

  // Fetch uptime data when device or period changes
  React.useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || !selectedDevice || !selectedNetwork) {
      setUptimeData([]);
      return;
    }
    setLoading(true);
    fetchDeviceUptimeData(
      token,
      selectedDevice,
      Number(period),
      selectedNetwork
    )
      .then(setUptimeData)
      .finally(() => setLoading(false));
  }, [selectedDevice, period, selectedNetwork]);

  // Transform uptimeData for recharts
  const chartData = uptimeData.map((item) => ({
    date: item.bucket,
    uptime: item.uptime_percentage,
    total_pings: item.total_pings,
  }));

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Device Uptime</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Uptime for the selected device and period.
          </span>
        </CardDescription>
        <CardAction className="flex flex-col gap-2 sm:flex-row sm:gap-4">
          {/* Network Dropdown */}
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <button
                className="w-48 h-8 px-3 py-1.5 rounded-md border bg-background text-sm text-left flex items-center justify-between"
                aria-label="Select network"
              >
                {(() => {
                  const name =
                    networks.find((n) => String(n.id) === selectedNetwork)
                      ?.name || "Select network";
                  return name.length > 15 ? name.slice(0, 15) + "..." : name;
                })()}
                <span className="ml-2">▼</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48">
              {networks.map((network) => (
                <DropdownMenuItem
                  key={network.id}
                  onSelect={() => setSelectedNetwork(String(network.id))}
                  className={
                    selectedNetwork === String(network.id)
                      ? "font-semibold bg-accent"
                      : ""
                  }
                >
                  {network.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          {/* Device Dropdown */}
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <button
                className="w-48 h-8 px-3 py-1.5 rounded-md border bg-background text-sm text-left flex items-center justify-between disabled:opacity-50"
                aria-label="Select device"
                disabled={!devices.length}
              >
                {devices.find((d) => String(d.id) === selectedDevice)?.name ||
                  "Select device"}
                <span className="ml-2">▼</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48">
              {devices.map((device) => (
                <DropdownMenuItem
                  key={device.id}
                  onSelect={() => setSelectedDevice(String(device.id))}
                  className={
                    selectedDevice === String(device.id)
                      ? "font-semibold bg-accent"
                      : ""
                  }
                >
                  {device.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <ToggleGroup
            type="single"
            value={period}
            onValueChange={(v) => v && setPeriod(v)}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
          >
            {periodOptions.map((opt) => (
              <ToggleGroupItem key={opt.value} value={opt.value}>
                {opt.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Select a value"
            >
              <SelectValue placeholder="Last 3 months" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {periodOptions.map((opt) => (
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
          config={{ uptime: { label: "Uptime %", color: "var(--primary)" } }}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="fillUptime" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-logo-dark-blue)"
                  stopOpacity={1.0}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-logo-dark-blue)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
              }}
            />
            <YAxis domain={[0, 100]} tickLine={false} axisLine={false} />
            <ChartTooltip
              cursor={false}
              defaultIndex={isMobile ? -1 : 10}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    const date = new Date(value);
                    // Format: hour:minute day/month/year, using browser locale
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
            <Area
              dataKey="uptime"
              type="monotone"
              fill="url(#fillUptime)"
              stroke="#cccccc"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
        {loading && <div className="text-center text-xs mt-2">Loading...</div>}
        {!loading && !uptimeData.length && (
          <div className="text-center text-xs mt-2">No data available.</div>
        )}
      </CardContent>
    </Card>
  );
};

export default UptimeAreaChart;
