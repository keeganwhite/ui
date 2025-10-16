"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { DeleteRewardDialogProps } from "@/lib/types";
import { deleteReward } from "@/lib/rewards";
import { toast } from "sonner";

const DeleteRewardDialog: React.FC<DeleteRewardDialogProps> = ({
  open,
  onClose,
  rewardId,
  refreshRewards,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    if (!rewardId) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    setIsLoading(true);

    try {
      await deleteReward(token, rewardId);
      toast.success("Reward deleted successfully.");
      refreshRewards();
      onClose();
    } catch (error) {
      console.error("Error deleting reward:", error);
      toast.error("Failed to delete reward.");
    }

    setIsLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Delete Reward</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete this reward? This action cannot be
            undone.
          </p>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteRewardDialog;
