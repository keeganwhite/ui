"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetchDevices, fetchNetworks } from "@/lib/network";
import { Device, Network } from "@/lib/types";
import { DeviceItemComponent } from "./index";
import RingLoader from "react-spinners/RingLoader";

const DeviceListComponent = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [networks, setNetworks] = useState<Network[]>([]);
  const [selectedNetwork, setSelectedNetwork] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const getDevices = async (networkId: string | number) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found");
        return;
      }
      const fetchedDevices = await fetchDevices(token, networkId);
      setDevices(fetchedDevices);
    } catch (error) {
      console.error("Error fetching devices:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getNetworks = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found");
        return;
      }
      const fetchedNetworks = await fetchNetworks(token);
      setNetworks(fetchedNetworks);
      // Default to the first network if available
      if (fetchedNetworks && fetchedNetworks.length > 0) {
        setSelectedNetwork(fetchedNetworks[0].id.toString());
        getDevices(fetchedNetworks[0].id);
      } else {
        setDevices([]);
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error fetching networks:", error);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    getNetworks();
  }, [getNetworks]);

  const handleNetworkChange = (networkId: string) => {
    setSelectedNetwork(networkId);
    getDevices(networkId);
  };

  const refreshDevices = () => {
    if (selectedNetwork) {
      getDevices(selectedNetwork);
    }
  };

  return (
    <Card className="min-w-[560px] min-h-[200px]">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Devices</CardTitle>
          <Select
            value={selectedNetwork || ""}
            onValueChange={handleNetworkChange}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select Network" />
            </SelectTrigger>
            <SelectContent>
              {networks.map((net) => (
                <SelectItem key={net.id} value={net.id.toString()}>
                  {net.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="flex justify-center pt-2">
            <div className="flex flex-col items-center gap-2">
              <RingLoader color="var(--color-logo-orange)" size={48} />
              <p className="text-sm text-muted-foreground">
                Loading devices...
              </p>
            </div>
          </div>
        )}
        {!isLoading && devices && devices.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {devices.map((device) => (
              <DeviceItemComponent
                key={device.id}
                device={device}
                refreshDevices={refreshDevices}
              />
            ))}
          </div>
        )}
        {!isLoading && devices && devices.length === 0 && (
          <div className="flex justify-center py-8">
            <p className="text-muted-foreground">
              No devices found for the selected network.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DeviceListComponent;
