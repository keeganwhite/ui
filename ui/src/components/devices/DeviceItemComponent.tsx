"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Wifi, Server, Shield, Globe, HelpCircle } from "lucide-react";
import { Device } from "@/lib/types";
import { EditDeviceDialog } from "./index";

interface DeviceItemComponentProps {
  device: Device;
  refreshDevices: () => void;
}

const DeviceItemComponent: React.FC<DeviceItemComponentProps> = ({
  device,
  refreshDevices,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleClose = async () => {
    await refreshDevices();
    setIsOpen(false);
  };

  const getDeviceIcon = (deviceType: string) => {
    const iconProps = { size: 24, className: "text-muted-foreground" };

    switch (deviceType) {
      case "access_point":
        return <Wifi {...iconProps} />;
      case "switch":
        return <Globe {...iconProps} />;
      case "server":
        return <Server {...iconProps} />;
      case "dns_server":
        return <Globe {...iconProps} />;
      case "firewall":
        return <Shield {...iconProps} />;
      default:
        return <HelpCircle {...iconProps} />;
    }
  };

  const handleOpenDialog = () => {
    setIsOpen(true);
  };

  return (
    <>
      <EditDeviceDialog isOpen={isOpen} onClose={handleClose} device={device} />
      <Card className="w-full shadow-md">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 min-w-0 flex-1">
              <div className="flex-shrink-0">
                {getDeviceIcon(device.device_type)}
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-sm font-medium truncate">
                  {device.name}
                </span>
                <span className="text-xs text-muted-foreground truncate">
                  {device.ip_address}
                </span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleOpenDialog}
              className="flex-shrink-0 ml-2"
            >
              <Edit className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default DeviceItemComponent;
