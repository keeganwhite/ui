"use client";

import React from "react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { RadiusVoucherSelectorProps } from "@/lib/types";

export const RadiusVoucherSelector: React.FC<RadiusVoucherSelectorProps> = ({
  radiusInstances,
  clouds,
  selectedInstance,
  selectedCloud,
  voucherLimit,
  searchQuery,
  searchType,
  pageSize,
  onInstanceChange,
  onCloudChange,
  onVoucherLimitChange,
  onSearchQueryChange,
  onSearchTypeChange,
  onPageSizeChange,
  onSearch,
  loading,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Select RADIUSDesk Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search & Voucher Limit Section */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 space-y-2">
              <Label htmlFor="search">
                {searchType === "username"
                  ? "Search by Username"
                  : "Search by Wallet Address"}
              </Label>
              <Input
                id="search"
                placeholder={
                  searchType === "username"
                    ? "Enter username..."
                    : "Enter wallet address..."
                }
                value={searchQuery}
                onChange={(e) => onSearchQueryChange(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="limit">Voucher Limit</Label>
              <Select
                value={voucherLimit.toString()}
                onValueChange={(value) => onVoucherLimitChange(parseInt(value))}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[10, 25, 50, 100, 150].map((limit) => (
                    <SelectItem key={limit} value={limit.toString()}>
                      {limit}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pageSize">Page Size</Label>
              <Select
                value={pageSize.toString()}
                onValueChange={(value) => onPageSizeChange(parseInt(value))}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[10, 20, 50, 100].map((size) => (
                    <SelectItem key={size} value={size.toString()}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Search Type Radio Group */}
          <div className="space-y-2">
            <Label>Search Type</Label>
            <RadioGroup
              value={searchType}
              onValueChange={(value: "username" | "wallet") =>
                onSearchTypeChange(value)
              }
              className="flex flex-row space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="username" id="username" />
                <Label htmlFor="username">Username</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="wallet" id="wallet" />
                <Label htmlFor="wallet">Wallet Address</Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        <Separator />

        {/* Instance and Cloud Selection */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="instance">RADIUSDesk Instance</Label>
            <Select
              value={selectedInstance}
              onValueChange={onInstanceChange}
              disabled={radiusInstances.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select RADIUSDesk instance" />
              </SelectTrigger>
              <SelectContent>
                {radiusInstances.map((instance) => (
                  <SelectItem key={instance.id} value={instance.id.toString()}>
                    {instance.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cloud">Cloud</Label>
            <Select
              value={selectedCloud}
              onValueChange={onCloudChange}
              disabled={clouds.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select cloud" />
              </SelectTrigger>
              <SelectContent>
                {clouds.map((cloud) => (
                  <SelectItem key={cloud.id} value={cloud.id.toString()}>
                    {cloud.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={onSearch}
            disabled={loading || !selectedInstance || !selectedCloud}
            className="w-full sm:w-auto hover:bg-logo-orange hover:text-white"
          >
            {loading ? "Searching..." : "Search"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
