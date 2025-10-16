"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Edit, Trash2, Ban, CheckCircle, Loader2 } from "lucide-react";
import { RewardItemProps } from "@/lib/types";
import { cancelReward, activateReward } from "@/lib/rewards";
import { toast } from "sonner";

const formatLocalTime = (isoString: string | null): string => {
  if (!isoString) return "N/A";
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(isoString));
};

const RewardItem: React.FC<RewardItemProps> = ({
  reward,
  onEdit,
  onDelete,
  refreshRewards,
}) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleCancel = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setIsUpdating(true);
    try {
      await cancelReward(token, reward.id);
      toast.success("Reward cancelled successfully.");
      refreshRewards();
    } catch (error) {
      console.error("Error canceling reward:", error);
      toast.error("Failed to cancel reward.");
    }
    setIsUpdating(false);
  };

  const handleActivate = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setIsUpdating(true);
    try {
      await activateReward(token, reward.id);
      toast.success("Reward activated successfully.");
      refreshRewards();
    } catch (error) {
      console.error("Error activating reward:", error);
      toast.error("Failed to activate reward.");
    }
    setIsUpdating(false);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">{reward.name}</h3>
            <p className="text-sm text-muted-foreground">
              Type: {reward.reward_type}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(reward)}
                    disabled={reward.once_off}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Edit Reward</p>
                </TooltipContent>
              </Tooltip>

              {reward.is_cancelled ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleActivate}
                      disabled={isUpdating || reward.once_off}
                    >
                      {isUpdating ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Activate Reward</p>
                  </TooltipContent>
                </Tooltip>
              ) : (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCancel}
                      disabled={isUpdating || reward.once_off}
                    >
                      {isUpdating ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Ban className="h-4 w-4 text-yellow-600" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Cancel Reward</p>
                  </TooltipContent>
                </Tooltip>
              )}

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(reward)}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Delete Reward</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          <p className="text-sm">
            Amount: <span className="font-medium">{reward.reward_amount}</span>
          </p>
          <div className="flex items-center gap-2">
            <Badge variant={reward.once_off ? "secondary" : "default"}>
              {reward.once_off ? "One-Time Reward" : "Recurring Reward"}
            </Badge>
            {reward.is_cancelled && (
              <Badge variant="destructive">Cancelled</Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Created: {formatLocalTime(reward.created_at)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default RewardItem;
