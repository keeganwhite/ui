"use client";

import React from "react";
import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ProtectedRoute from "@/lib/ProtectedRoute";
import UptimeBarChart from "@/components/charts/UptimeBarChart";
import DeviceUptimeLineChart from "@/components/charts/DeviceUptimeLineChart";
import { fetchNetworks } from "@/lib/network";
import { Network } from "@/lib/types";
import RingLoader from "react-spinners/RingLoader";

export default function NetworkMonitoringPage() {
  const [networks, setNetworks] = React.useState<Network[]>([]);
  const [selectedNetwork, setSelectedNetwork] = React.useState<string>("");
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const loadNetworks = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No token found");

        const networksData = await fetchNetworks(token);
        setNetworks(networksData);
        if (networksData.length > 0) {
          setSelectedNetwork(String(networksData[0].id));
        }
      } catch (error) {
        console.error("Error fetching networks:", error);
        setNetworks([]);
      } finally {
        setLoading(false);
      }
    };
    loadNetworks();
  }, []);

  const handleNetworkChange = (value: string) => {
    setSelectedNetwork(value);
  };

  return (
    <ProtectedRoute>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator
                orientation="vertical"
                className="mr-2 data-[orientation=vertical]:h-4"
              />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink href="/network/monitoring">
                      Network
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/network/monitoring">
                      Monitoring
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>
          <div className="@container/main w-full max-w-7.5xl flex flex-col gap-6 px-4 lg:px-8 py-8 mx-auto">
            <div className="flex flex-col gap-4">
              <h1 className="text-2xl font-bold">Network Monitoring</h1>
              <p className="text-muted-foreground">
                Real-time monitoring and analytics for your network performance.
              </p>

              {/* Network Selection */}
              <div className="flex items-center gap-4">
                <label htmlFor="network-select" className="text-sm font-medium">
                  Select Network:
                </label>
                <Select
                  value={selectedNetwork}
                  onValueChange={handleNetworkChange}
                >
                  <SelectTrigger
                    id="network-select"
                    className="w-64"
                    disabled={loading}
                  >
                    <SelectValue placeholder="Select a network" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border border-border">
                    {networks.map((network) => (
                      <SelectItem key={network.id} value={String(network.id)}>
                        {network.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {loading && (
                  <RingLoader color="var(--color-logo-orange)" size={20} />
                )}
              </div>
            </div>

            {/* Charts with Tabs */}
            {selectedNetwork && (
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-muted border border-border rounded-lg">
                  <TabsTrigger
                    value="overview"
                    className="data-[state=active]:bg-logo-dark-blue data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                  >
                    Device Overview
                  </TabsTrigger>
                  <TabsTrigger
                    value="timeline"
                    className="data-[state=active]:bg-logo-dark-blue data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                  >
                    Device Timeline
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="mt-6">
                  <UptimeBarChart networkId={selectedNetwork} />
                </TabsContent>

                <TabsContent value="timeline" className="mt-6">
                  <DeviceUptimeLineChart networkId={selectedNetwork} />
                </TabsContent>
              </Tabs>
            )}

            {!selectedNetwork && !loading && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  No networks available. Please select a network to view
                  monitoring data.
                </p>
              </div>
            )}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </ProtectedRoute>
  );
}
