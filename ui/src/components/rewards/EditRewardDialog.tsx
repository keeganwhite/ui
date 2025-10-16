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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  IntervalOption,
  EditRewardDialogProps,
  Device,
  UserDetail,
} from "@/lib/types";
import { updateReward } from "@/lib/rewards";
import { fetchDevices } from "@/lib/devies";
import { GetUserById } from "@/lib/user";
import UserSearch from "../devices/UserSearch";

const intervalOptions: IntervalOption[] = [
  { label: "1 Minute", value: 1 },
  { label: "1 Day", value: 1440 },
  { label: "7 Days", value: 10080 },
  { label: "30 Days", value: 43200 },
];

const EditRewardDialog: React.FC<EditRewardDialogProps> = ({
  open,
  onClose,
  reward,
  refreshRewards,
}) => {
  const [name, setName] = useState("");
  const [user, setUser] = useState<UserDetail | null>(null);
  const [rewardAmount, setRewardAmount] = useState("");
  const [interval, setInterval] = useState(1);
  const [selectedDevice, setSelectedDevice] = useState("");
  const [devices, setDevices] = useState<Device[]>([]);
  const [userDevices, setUserDevices] = useState<Device[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load devices when the dialog opens
  useEffect(() => {
    const loadDevices = async () => {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const devicesData = await fetchDevices(token);
        setDevices(devicesData);
      } catch (error) {
        console.error("Error fetching devices:", error);
      }
      setIsLoading(false);
    };

    if (open) {
      loadDevices();
    }
  }, [open]);

  // Update state when `reward` changes
  useEffect(() => {
    const fetchUser = async () => {
      if (!reward?.user) return;

      setIsLoading(true);
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const userData = await GetUserById(token, reward.user);
        // Convert User to UserDetail by adding phone_number
        const userDetail: UserDetail = {
          ...userData,
          phone_number: null, // Default to null since User doesn't have phone_number
        };
        setUser(userDetail);
      } catch (_error) {
        console.error("Error fetching user:", _error);
        // Handle error appropriately - could show toast here if needed
      }
      setIsLoading(false);
    };

    if (reward) {
      setName(reward.name || "");
      setRewardAmount(reward.reward_amount?.toString() || "");
      setInterval(reward.interval_minutes || 1);
      setSelectedDevice(reward.device?.toString() || "");

      fetchUser();
    }
  }, [reward]);

  // Load user-specific devices when user is set
  useEffect(() => {
    if (user?.id) {
      const userSpecificDevices = devices.filter(
        (device) => device.user === user.id
      );
      setUserDevices(userSpecificDevices);
    }
  }, [user, devices]);

  const handleSubmit = async () => {
    if (!reward) return;

    setIsLoading(true);
    const token = localStorage.getItem("token");
    if (!token) return;

    const payload = {
      name,
      user: user?.id || null,
      device: selectedDevice ? parseInt(selectedDevice) : null,
      reward_amount: parseFloat(rewardAmount),
      interval_minutes: reward.once_off ? null : interval,
    };

    try {
      await updateReward(token, reward.id, payload);
      toast.success("Reward updated successfully.");
      refreshRewards();
      handleClose();
    } catch (error) {
      console.error("Error updating reward:", error);
      toast.error("Failed to update reward.");
    }

    setIsLoading(false);
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Reward</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Reward Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter reward name"
            />
          </div>

          <div className="space-y-2">
            <Label>User</Label>
            <UserSearch onUserSelected={setUser} value={user} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="device">Select Device</Label>
            <Select
              value={selectedDevice}
              onValueChange={setSelectedDevice}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a device" />
              </SelectTrigger>
              <SelectContent>
                {userDevices.length > 0 ? (
                  userDevices.map((device) => (
                    <SelectItem key={device.id} value={device.id.toString()}>
                      {device.name || `Device ${device.id}`}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-devices" disabled>
                    No devices available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Reward Amount</Label>
            <Input
              id="amount"
              type="number"
              value={rewardAmount}
              onChange={(e) => setRewardAmount(e.target.value)}
              placeholder="Enter amount"
            />
          </div>

          {!reward?.once_off && (
            <div className="space-y-2">
              <Label htmlFor="interval">Interval</Label>
              <Select
                value={interval.toString()}
                onValueChange={(value) => setInterval(Number(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {intervalOptions.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value.toString()}
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Update
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditRewardDialog;
