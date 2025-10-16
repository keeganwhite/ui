"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createDevice } from "@/lib/network";
import { DeviceCreatePayload, Network } from "@/lib/types";
import { toast } from "sonner";

interface CreateDeviceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  networks: Network[];
  selectedNetwork: string | null;
  onDeviceCreated: () => void;
}

const CreateDeviceDialog: React.FC<CreateDeviceDialogProps> = ({
  isOpen,
  onClose,
  networks,
  selectedNetwork,
  onDeviceCreated,
}) => {
  const [formData, setFormData] = useState<DeviceCreatePayload>({
    name: "",
    ip_address: "",
    mac_address: "",
    network_id: selectedNetwork ? parseInt(selectedNetwork) : 0,
    device_type: "unknown",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (
    field: keyof DeviceCreatePayload,
    value: string | number
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("No authentication token found");
        return;
      }

      if (!formData.network_id) {
        toast.error("Please select a network");
        return;
      }

      await createDevice(token, formData);
      toast.success("Device created successfully");
      onDeviceCreated();
      onClose();
      // Reset form
      setFormData({
        name: "",
        ip_address: "",
        mac_address: "",
        network_id: selectedNetwork ? parseInt(selectedNetwork) : 0,
        device_type: "unknown",
      });
    } catch (error) {
      console.error("Error creating device:", error);
      toast.error("Failed to create device");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Device</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Device Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Enter device name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ip_address">IP Address</Label>
            <Input
              id="ip_address"
              value={formData.ip_address}
              onChange={(e) => handleInputChange("ip_address", e.target.value)}
              placeholder="Enter IP address"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="mac_address">MAC Address</Label>
            <Input
              id="mac_address"
              value={formData.mac_address}
              onChange={(e) => handleInputChange("mac_address", e.target.value)}
              placeholder="Enter MAC address (optional)"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="network_id">Network</Label>
            <Select
              value={formData.network_id.toString()}
              onValueChange={(value) =>
                handleInputChange("network_id", parseInt(value))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select network" />
              </SelectTrigger>
              <SelectContent>
                {networks.map((network) => (
                  <SelectItem key={network.id} value={network.id.toString()}>
                    {network.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="device_type">Device Type</Label>
            <Select
              value={
                typeof formData.device_type === "string"
                  ? formData.device_type
                  : ""
              }
              onValueChange={(value) => handleInputChange("device_type", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select device type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="access_point">Access Point</SelectItem>
                <SelectItem value="switch">Switch</SelectItem>
                <SelectItem value="server">Server</SelectItem>
                <SelectItem value="dns_server">DNS Server</SelectItem>
                <SelectItem value="firewall">Firewall</SelectItem>
                <SelectItem value="unknown">Unknown</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Device"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateDeviceDialog;
