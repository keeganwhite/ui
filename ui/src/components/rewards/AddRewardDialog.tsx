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
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  RewardTypeOption,
  IntervalOption,
  AddRewardDialogProps,
  UserDetail,
} from "@/lib/types";
import { createReward } from "@/lib/rewards";
import { fetchDevices } from "@/lib/devies";
import { Device } from "@/lib/types";
import UserSearch from "../devices/UserSearch";

const rewardTypes: RewardTypeOption[] = [
  { value: "uptime", label: "Uptime Based" },
  { value: "custom", label: "Custom" },
];

const intervalOptions: IntervalOption[] = [
  { label: "1 Minute", value: 1 },
  { label: "1 Day", value: 1440 }, // 1 day = 1440 minutes
  { label: "7 Days", value: 10080 }, // 7 days = 10080 minutes
  { label: "30 Days", value: 43200 }, // 30 days = 43200 minutes
];

const AddRewardDialog: React.FC<AddRewardDialogProps> = ({
  open,
  onClose,
  refreshRewards,
}) => {
  const [name, setName] = useState("");
  const [user, setUser] = useState<UserDetail | null>(null);
  const [rewardType, setRewardType] = useState<"uptime" | "custom">("uptime");
  const [rewardAmount, setRewardAmount] = useState("");
  const [onceOff, setOnceOff] = useState(true);
  const [interval, setInterval] = useState(1);
  const [selectedDevice, setSelectedDevice] = useState("");
  const [devices, setDevices] = useState<Device[]>([]);
  const [userDevices, setUserDevices] = useState<Device[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const getDevices = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const devicesData = await fetchDevices(token);
      setDevices(devicesData);
    } catch (error) {
      console.error("Error fetching devices:", error);
    }
  };

  useEffect(() => {
    if (open) {
      const loadData = async () => {
        setIsLoading(true);
        await getDevices();
        setIsLoading(false);
      };
      loadData();
    }
  }, [open]);

  useEffect(() => {
    if (user?.id) {
      const userSpecificDevices = devices.filter(
        (device) => device.user === user.id
      );
      setUserDevices(userSpecificDevices);
    } else {
      setUserDevices([]);
    }
  }, [user, devices]);

  const handleSubmit = async () => {
    setIsLoading(true);
    const token = localStorage.getItem("token");
    if (!token) return;

    const payload = {
      name: name,
      user: user?.id || null,
      device: selectedDevice ? parseInt(selectedDevice) : null,
      reward_type: rewardType,
      reward_amount: parseFloat(rewardAmount),
      once_off: onceOff,
      interval_minutes: onceOff ? null : interval,
    };

    try {
      await createReward(token, payload);
      toast.success("Successfully added reward.");
      refreshRewards();
      handleClose();
    } catch (error) {
      console.error("Error in creating reward", error);
      toast.error("Failed to add reward.");
    }

    setIsLoading(false);
  };

  const handleUserSelected = async (selectedUser: UserDetail | null) => {
    await getDevices();
    setUser(selectedUser);
  };

  const handleClose = () => {
    setName("");
    setUser(null);
    setRewardType("uptime");
    setRewardAmount("");
    setOnceOff(true);
    setInterval(1);
    setSelectedDevice("");
    setDevices([]);
    setUserDevices([]);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Reward</DialogTitle>
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
            <UserSearch onUserSelected={handleUserSelected} value={user} />
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
              <SelectContent className="bg-card">
                {isLoading ? (
                  <SelectItem value="loading" disabled>
                    <div className="flex items-center gap-2 bg-card">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading Devices...
                    </div>
                  </SelectItem>
                ) : userDevices.length > 0 ? (
                  userDevices.map((device) => (
                    <SelectItem key={device.id} value={device.id.toString()}>
                      {device.name || `Device ${device.id}`}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-devices" disabled className="bg-card">
                    No devices available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="rewardType">Reward Type</Label>
            <Select
              value={rewardType}
              onValueChange={(value: "uptime" | "custom") =>
                setRewardType(value)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card">
                {rewardTypes.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
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

          <div className="flex items-center space-x-2">
            <Checkbox
              id="onceOff"
              checked={onceOff}
              onCheckedChange={(checked) => setOnceOff(checked as boolean)}
            />
            <Label htmlFor="onceOff">One-Time Reward</Label>
          </div>

          {!onceOff && (
            <div className="space-y-2">
              <Label htmlFor="interval">Interval</Label>
              <Select
                value={interval.toString()}
                onValueChange={(value) => setInterval(Number(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card">
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
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="bg-white text-black hover:bg-logo-orange hover:text-white"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddRewardDialog;
