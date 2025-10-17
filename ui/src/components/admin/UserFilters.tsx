"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IconSearch, IconFilterOff } from "@tabler/icons-react";
import { AdminUserFilters } from "@/lib/types";

interface UserFiltersProps {
  filters: AdminUserFilters;
  onFiltersChange: (filters: AdminUserFilters) => void;
  onApplyFilters: () => void;
  loading?: boolean;
}

export function UserFilters({
  filters,
  onFiltersChange,
  onApplyFilters,
  loading = false,
}: UserFiltersProps) {
  const [localFilters, setLocalFilters] = useState<AdminUserFilters>(filters);

  const handleFilterChange = (
    key: keyof AdminUserFilters,
    value: boolean | string
  ) => {
    setLocalFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleApply = () => {
    onFiltersChange(localFilters);
    onApplyFilters();
  };

  const handleClear = () => {
    const emptyFilters: AdminUserFilters = {};
    setLocalFilters(emptyFilters);
    onFiltersChange(emptyFilters);
    onApplyFilters();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleApply();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconSearch size={20} />
          Filters
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="search">Search</Label>
          <Input
            id="search"
            placeholder="Search by username, email, or name..."
            value={localFilters.search || ""}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            onKeyPress={handleKeyPress}
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="has_wallet" className="text-sm font-normal">
              Has Wallet
            </Label>
            <Switch
              id="has_wallet"
              checked={localFilters.has_wallet ?? false}
              onCheckedChange={(checked: boolean) =>
                handleFilterChange("has_wallet", checked)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="has_imsi" className="text-sm font-normal">
              Has IMSI
            </Label>
            <Switch
              id="has_imsi"
              checked={localFilters.has_imsi ?? false}
              onCheckedChange={(checked: boolean) =>
                handleFilterChange("has_imsi", checked)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="is_active" className="text-sm font-normal">
              Active Users
            </Label>
            <Switch
              id="is_active"
              checked={localFilters.is_active ?? false}
              onCheckedChange={(checked: boolean) =>
                handleFilterChange("is_active", checked)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="is_staff" className="text-sm font-normal">
              Staff Users
            </Label>
            <Switch
              id="is_staff"
              checked={localFilters.is_staff ?? false}
              onCheckedChange={(checked: boolean) =>
                handleFilterChange("is_staff", checked)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="is_superuser" className="text-sm font-normal">
              Superusers
            </Label>
            <Switch
              id="is_superuser"
              checked={localFilters.is_superuser ?? false}
              onCheckedChange={(checked: boolean) =>
                handleFilterChange("is_superuser", checked)
              }
            />
          </div>
        </div>

        <div className="flex flex-col gap-2 pt-2">
          <Button
            onClick={handleApply}
            disabled={loading}
            variant="logo"
            className="w-full"
          >
            Apply Filters
          </Button>
          <Button
            onClick={handleClear}
            variant="outline"
            disabled={loading}
            className="w-full"
          >
            <IconFilterOff size={16} className="mr-2" />
            Clear Filters
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
