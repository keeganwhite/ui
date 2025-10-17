"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import ButtonLoading from "@/components/ui/ButtonLoading";
import { AdminUser, AdminUserUpdatePayload } from "@/lib/types";
import { updateAdminUser } from "@/lib/adminUsers";
import { useAuth } from "@/lib/authContext";
import { toast } from "sonner";
import { IconWallet, IconDeviceMobile } from "@tabler/icons-react";

interface EditUserDialogProps {
  user: AdminUser | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUserUpdated: () => void;
}

export function EditUserDialog({
  user,
  open,
  onOpenChange,
  onUserUpdated,
}: EditUserDialogProps) {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<AdminUserUpdatePayload>({});

  useEffect(() => {
    if (user) {
      // Only initialize editable fields
      setFormData({
        phone_number: user.phone_number || "",
        imsi: user.imsi || "",
        is_active: user.is_active,
        is_staff: user.is_staff,
        is_superuser: user.is_superuser,
      });
    }
  }, [user]);

  const handleChange = (
    field: keyof AdminUserUpdatePayload,
    value: string | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !token) return;

    setLoading(true);
    try {
      // Only send editable fields
      const payload: AdminUserUpdatePayload = {
        phone_number: formData.phone_number || "",
        imsi: formData.imsi || "",
        is_active: formData.is_active,
        is_staff: formData.is_staff,
        is_superuser: formData.is_superuser,
      };

      await updateAdminUser(token, user.id, payload);
      toast.success("User updated successfully");
      onUserUpdated();
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Failed to update user");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit User: {user.username}</DialogTitle>
          <DialogDescription>
            Update phone number, IMSI, and permissions. Other fields are
            read-only.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Read-only badges */}
          <div className="space-y-2">
            <Label>User Features</Label>
            <div className="flex gap-2 flex-wrap">
              <Badge variant="outline">ID: {user.id}</Badge>
              {user.has_wallet && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <IconWallet size={14} />
                  Has Wallet
                </Badge>
              )}
              {user.has_imsi && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <IconDeviceMobile size={14} />
                  Has IMSI
                </Badge>
              )}
              {user.wallet_address && (
                <Badge variant="outline" className="text-xs">
                  Wallet: {user.wallet_address.slice(0, 10)}...
                </Badge>
              )}
            </div>
          </div>

          <Separator />

          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="font-semibold">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={user.username || ""}
                  disabled
                  className="bg-muted cursor-not-allowed"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={user.email || ""}
                  disabled
                  className="bg-muted cursor-not-allowed"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="first_name">First Name</Label>
                <Input
                  id="first_name"
                  value={user.first_name || ""}
                  disabled
                  className="bg-muted cursor-not-allowed"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name</Label>
                <Input
                  id="last_name"
                  value={user.last_name || ""}
                  disabled
                  className="bg-muted cursor-not-allowed"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone_number">Phone Number</Label>
                <Input
                  id="phone_number"
                  value={formData.phone_number || ""}
                  onChange={(e) => handleChange("phone_number", e.target.value)}
                  placeholder="Enter phone number"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Product Settings */}
          <div className="space-y-4">
            <h3 className="font-semibold">Product Settings</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="imsi">IMSI</Label>
                <Input
                  id="imsi"
                  value={formData.imsi || ""}
                  onChange={(e) => handleChange("imsi", e.target.value)}
                  maxLength={20}
                  placeholder="Enter IMSI"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="product_id_data">Product ID (Data)</Label>
                <Input
                  id="product_id_data"
                  value={user.product_id_data || ""}
                  disabled
                  className="bg-muted cursor-not-allowed"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="product_id_cents">Product ID (Cents)</Label>
                <Input
                  id="product_id_cents"
                  value={user.product_id_cents || ""}
                  disabled
                  className="bg-muted cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Permissions */}
          <div className="space-y-4">
            <h3 className="font-semibold">Permissions & Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="is_active" className="text-sm font-normal">
                  Active
                </Label>
                <Switch
                  id="is_active"
                  checked={formData.is_active ?? false}
                  onCheckedChange={(checked: boolean) =>
                    handleChange("is_active", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="is_staff" className="text-sm font-normal">
                  Staff
                </Label>
                <Switch
                  id="is_staff"
                  checked={formData.is_staff ?? false}
                  onCheckedChange={(checked: boolean) =>
                    handleChange("is_staff", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="is_superuser" className="text-sm font-normal">
                  Superuser
                </Label>
                <Switch
                  id="is_superuser"
                  checked={formData.is_superuser ?? false}
                  onCheckedChange={(checked: boolean) =>
                    handleChange("is_superuser", checked)
                  }
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            {loading ? (
              <ButtonLoading disabled />
            ) : (
              <Button type="submit" variant="logo" disabled={loading}>
                Save Changes
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
