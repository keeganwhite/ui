"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  listAllRadiusInstances,
  listClouds,
  listProfiles,
  listRealms,
  createVoucher,
} from "@/lib/radiusdesk";
import {
  RadiusDeskInstance,
  RadiusDeskCloud,
  RadiusDeskRealm,
  RadiusDeskProfile,
  CreateVoucherDialogProps,
  VoucherCreatePayload,
} from "@/lib/types";

export const CreateVoucherDialog: React.FC<CreateVoucherDialogProps> = ({
  onVoucherCreated,
}) => {
  const [open, setOpen] = useState(false);
  const [radiusInstances, setRadiusInstances] = useState<RadiusDeskInstance[]>(
    []
  );
  const [realms, setRealms] = useState<RadiusDeskRealm[]>([]);
  const [profiles, setProfiles] = useState<RadiusDeskProfile[]>([]);
  const [clouds, setClouds] = useState<RadiusDeskCloud[]>([]);
  const [selectedRadiusInstance, setSelectedRadiusInstance] =
    useState<string>("");
  const [selectedRealm, setSelectedRealm] = useState<string>("");
  const [selectedProfile, setSelectedProfile] = useState<string>("");
  const [selectedCloud, setSelectedCloud] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [voucherDetails, setVoucherDetails] = useState<string | null>(null);
  const [showVoucherDialog, setShowVoucherDialog] = useState(false);

  // Fetch RADIUSDesk Instances
  useEffect(() => {
    const fetchRadiusInstances = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          toast.error("No authentication token found");
          return;
        }
        const data = await listAllRadiusInstances(token);
        setRadiusInstances(data);
        if (data.length > 0) {
          setSelectedRadiusInstance(data[0].id.toString());
        }
      } catch (error) {
        console.error("Failed to fetch radius instances", error);
        toast.error("Failed to fetch RADIUSDesk instances");
      } finally {
        setLoading(false);
      }
    };

    fetchRadiusInstances();
  }, []);

  // Fetch Clouds when Radius Instance changes
  useEffect(() => {
    if (!selectedRadiusInstance) {
      setClouds([]);
      setSelectedCloud("");
      setRealms([]);
      setSelectedRealm("");
      setProfiles([]);
      setSelectedProfile("");
      return;
    }

    const fetchClouds = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const data = await listClouds(token, parseInt(selectedRadiusInstance));
        setClouds(data);
        if (data.length > 0) {
          setSelectedCloud(data[0].id.toString());
        }
      } catch (error) {
        console.error("Failed to fetch clouds", error);
        toast.error("Failed to fetch clouds");
      }
    };

    fetchClouds();
  }, [selectedRadiusInstance]);

  // Fetch Realms when Cloud changes
  useEffect(() => {
    if (!selectedCloud) {
      setRealms([]);
      setSelectedRealm("");
      setProfiles([]);
      setSelectedProfile("");
      return;
    }

    const fetchRealms = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const data = await listRealms(token, parseInt(selectedCloud));
        setRealms(data);
        if (data.length > 0) {
          setSelectedRealm(data[0].id.toString());
        }
      } catch (error) {
        console.error("Failed to fetch realms", error);
        toast.error("Failed to fetch realms");
      }
    };

    fetchRealms();
  }, [selectedCloud]);

  // Fetch Profiles when Realm changes
  useEffect(() => {
    if (!selectedRealm) {
      setProfiles([]);
      setSelectedProfile("");
      return;
    }

    const fetchProfiles = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const data = await listProfiles(token, parseInt(selectedRealm));
        setProfiles(data);
        if (data.length > 0) {
          setSelectedProfile(data[0].id.toString());
        }
      } catch (error) {
        console.error("Failed to fetch profiles", error);
        toast.error("Failed to fetch profiles");
      }
    };

    fetchProfiles();
  }, [selectedRealm]);

  const handleSubmit = async () => {
    if (!selectedProfile) {
      toast.error("Please select all required fields");
      return;
    }

    setSubmitting(true);
    const payload: VoucherCreatePayload = {
      radius_desk_instance_pk: parseInt(selectedRadiusInstance),
      radius_desk_profile_pk: parseInt(selectedProfile),
      radius_desk_cloud_pk: parseInt(selectedCloud),
      radius_desk_realm_pk: parseInt(selectedRealm),
    };

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("No authentication token found");
        return;
      }
      const voucherResponse = await createVoucher(token, payload);
      console.log("Voucher response:", voucherResponse);
      setVoucherDetails(voucherResponse.voucher);
      setShowVoucherDialog(true);
      onVoucherCreated?.();
      toast.success("Voucher created successfully!");
    } catch (error) {
      console.error("Error creating voucher:", error);
      toast.error("Failed to create voucher");
    } finally {
      setSubmitting(false);
    }
  };

  const handleVoucherCreated = () => {
    setOpen(false);
    setShowVoucherDialog(false);
    setVoucherDetails(null);
    onVoucherCreated?.();
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      // Reset form when dialog closes
      setSelectedRadiusInstance(
        radiusInstances.length > 0 ? radiusInstances[0].id.toString() : ""
      );
      setSelectedCloud("");
      setSelectedRealm("");
      setSelectedProfile("");
      setVoucherDetails(null);
      setShowVoucherDialog(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <Button className="mb-4 hover:bg-logo-orange hover:text-white">
            Create Coupon
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create a New RADIUSDesk Coupon</DialogTitle>
            <DialogDescription>
              Configure the settings for your new internet access coupon.
            </DialogDescription>
          </DialogHeader>

          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-32" />
            </div>
          ) : (
            <div className="space-y-4">
              {/* RADIUSDesk Instance Selection */}
              <div className="space-y-2">
                <Label htmlFor="radius-instance">RADIUSDesk Instance</Label>
                <Select
                  value={selectedRadiusInstance}
                  onValueChange={setSelectedRadiusInstance}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select RADIUSDesk instance" />
                  </SelectTrigger>
                  <SelectContent>
                    {radiusInstances.map((instance) => (
                      <SelectItem
                        key={instance.id}
                        value={instance.id.toString()}
                      >
                        {instance.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Cloud Selection */}
              <div className="space-y-2">
                <Label htmlFor="cloud">Cloud</Label>
                <Select
                  value={selectedCloud}
                  onValueChange={setSelectedCloud}
                  disabled={!selectedRadiusInstance}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select cloud" />
                  </SelectTrigger>
                  <SelectContent>
                    {clouds.length > 0 ? (
                      clouds.map((cloud) => (
                        <SelectItem key={cloud.id} value={cloud.id.toString()}>
                          {cloud.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-clouds" disabled>
                        No clouds available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Realm Selection */}
              <div className="space-y-2">
                <Label htmlFor="realm">Realm</Label>
                <Select
                  value={selectedRealm}
                  onValueChange={setSelectedRealm}
                  disabled={!selectedCloud}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select realm" />
                  </SelectTrigger>
                  <SelectContent>
                    {realms.map((realm) => (
                      <SelectItem key={realm.id} value={realm.id.toString()}>
                        {realm.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Profile Selection */}
              <div className="space-y-2">
                <Label htmlFor="profile">Profile</Label>
                <Select
                  value={selectedProfile}
                  onValueChange={setSelectedProfile}
                  disabled={!selectedRealm}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select profile" />
                  </SelectTrigger>
                  <SelectContent>
                    {profiles.map((profile) => (
                      <SelectItem
                        key={profile.id}
                        value={profile.id.toString()}
                      >
                        {profile.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleSubmit}
                disabled={!selectedProfile || submitting}
                className="w-full hover:bg-logo-orange hover:text-white"
              >
                {submitting ? "Creating..." : "Create Voucher"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Voucher Created Success Dialog */}
      {showVoucherDialog && voucherDetails && (
        <Dialog open={showVoucherDialog} onOpenChange={setShowVoucherDialog}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>Voucher Created Successfully!</DialogTitle>
              <DialogDescription>
                Your new internet access coupon has been created.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <Label className="text-sm font-medium">Voucher Code:</Label>
                <p className="font-mono text-lg mt-1 break-all">
                  {voucherDetails}
                </p>
              </div>
              <Button onClick={handleVoucherCreated} className="w-full">
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};
