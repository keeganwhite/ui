"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { updateDevice } from "@/lib/network";
import { Device, DeviceUpdatePayload, UserDetail } from "@/lib/types";
import { toast } from "sonner";
import UserSearch from "./UserSearch";

interface EditDeviceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  device: Device;
}

const EditDeviceDialog: React.FC<EditDeviceDialogProps> = ({
  isOpen,
  onClose,
  device,
}) => {
  const [formData, setFormData] = useState<DeviceUpdatePayload>({
    name: device.name,
    ip_address: device.ip_address,
    mac_address: device.mac_address || "",
    device_type: device.device_type,
    user: device.user || device.user_detail?.id || null,
    network: device.network, // Add the network field
  });
  const [selectedUser, setSelectedUser] = useState(device.user_detail || null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setFormData({
      name: device.name,
      ip_address: device.ip_address,
      mac_address: device.mac_address || "",
      device_type: device.device_type,
      user: device.user || device.user_detail?.id || null,
      network: device.network, // Add the network field
    });
    setSelectedUser(device.user_detail || null);
  }, [device]);

  const handleInputChange = (
    field: keyof DeviceUpdatePayload,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleUserSelected = (user: UserDetail | null) => {
    setSelectedUser(user);
    setFormData((prev) => ({
      ...prev,
      user: user ? user.id : null,
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

      await updateDevice(token, device.id, formData);
      toast.success("Device updated successfully");
      onClose();
    } catch (error) {
      console.error("Error updating device:", error);
      toast.error("Failed to update device");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Device</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Device Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Enter device name"
              disabled
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ip_address">IP Address</Label>
            <Input
              id="ip_address"
              value={formData.ip_address}
              onChange={(e) => handleInputChange("ip_address", e.target.value)}
              placeholder="Enter IP address"
              disabled
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="mac_address">MAC Address</Label>
            <Input
              id="mac_address"
              value={formData.mac_address}
              onChange={(e) => handleInputChange("mac_address", e.target.value)}
              placeholder="Enter MAC address (optional)"
              disabled
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="device_type">Device Type</Label>
            <Input
              id="device_type"
              value={
                typeof formData.device_type === "string"
                  ? formData.device_type
                  : ""
              }
              onChange={(e) => handleInputChange("device_type", e.target.value)}
              placeholder="Device type"
              disabled
            />
          </div>

          <div className="space-y-2">
            <Label>User</Label>
            <div className="flex gap-2">
              <div className="flex-1">
                <UserSearch
                  onUserSelected={handleUserSelected}
                  value={selectedUser}
                />
              </div>
              {selectedUser && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleUserSelected(null)}
                  className="shrink-0"
                >
                  Clear User
                </Button>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <div className="space-x-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditDeviceDialog;
