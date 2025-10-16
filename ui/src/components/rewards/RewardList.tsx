"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import { Skeleton } from "@/components/ui/skeleton";
import { Plus, AlertCircle } from "lucide-react";
import { Reward, RewardListProps } from "@/lib/types";
import {
  RewardItem,
  AddRewardDialog,
  EditRewardDialog,
  DeleteRewardDialog,
} from "./index";

const RewardList: React.FC<RewardListProps> = ({
  rewards,
  refreshRewards,
  loading,
}) => {
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);

  // Handlers for opening/closing dialogs
  const handleAddOpen = () => setOpenAddDialog(true);
  const handleAddClose = () => setOpenAddDialog(false);

  const handleEditOpen = (reward: Reward) => {
    setSelectedReward(reward);
    setOpenEditDialog(true);
  };
  const handleEditClose = () => setOpenEditDialog(false);

  const handleDeleteOpen = (reward: Reward) => {
    setSelectedReward(reward);
    setOpenDeleteDialog(true);
  };
  const handleDeleteClose = () => setOpenDeleteDialog(false);

  return (
    <Card className="min-w-[560px] min-h-[200px]">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Rewards</h2>
          <Button
            onClick={handleAddOpen}
            className="flex items-center gap-2 bg-white text-black hover:bg-logo-orange hover:text-white"
          >
            <Plus className="h-4 w-4" />
            Add Reward
          </Button>
        </div>

        {loading && (
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4">
                <Skeleton className="h-32 w-1/2" />
                <Skeleton className="h-32 w-1/2" />
              </div>
            ))}
          </div>
        )}

        {!loading && rewards.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rewards.map((reward) => (
              <RewardItem
                key={reward.id}
                reward={reward}
                onEdit={handleEditOpen}
                onDelete={handleDeleteOpen}
                refreshRewards={refreshRewards}
              />
            ))}
          </div>
        )}

        {!loading && rewards.length === 0 && (
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            <AlertCircle className="h-4 w-4 mr-2" />
            No rewards to display.
          </div>
        )}

        {/* Dialogs for Add, Edit, Delete */}
        <AddRewardDialog
          open={openAddDialog}
          onClose={handleAddClose}
          refreshRewards={refreshRewards}
        />

        <EditRewardDialog
          open={openEditDialog}
          onClose={handleEditClose}
          reward={selectedReward}
          refreshRewards={refreshRewards}
        />

        <DeleteRewardDialog
          open={openDeleteDialog}
          onClose={handleDeleteClose}
          rewardId={selectedReward?.id || null}
          refreshRewards={refreshRewards}
        />
      </CardContent>
    </Card>
  );
};

export default RewardList;
