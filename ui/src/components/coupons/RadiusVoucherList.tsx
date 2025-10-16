"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { RadiusVoucherListProps, VoucherDetailedStats } from "@/lib/types";
import { getVoucherDetailedStats } from "@/lib/radiusdesk";
import { toast } from "sonner";

export const RadiusVoucherList: React.FC<RadiusVoucherListProps> = ({
  vouchers,
  dbVouchers,
  userMap,
  loading,
  pagination,
  onPageChange,
  selectedInstance,
  selectedCloud,
}) => {
  const [selectedVoucher, setSelectedVoucher] = useState<string | null>(null);
  const [voucherDetails, setVoucherDetails] =
    useState<VoucherDetailedStats | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  // Function to format date
  const formatDate = (dateString: string | null): string => {
    if (!dateString) return "Never";
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return "Invalid Date";
    }
  };

  // Function to format bytes
  const formatBytes = (bytes: string | number | null | undefined): string => {
    if (bytes === null || bytes === undefined) return "0 B";

    // Convert string to number
    const num = typeof bytes === "string" ? parseFloat(bytes) : bytes;

    // Check if the number is valid
    if (isNaN(num) || num < 0) {
      return "0 B";
    }

    if (num === 0) return "0 B";

    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(num) / Math.log(k));
    return parseFloat((num / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Function to handle voucher details
  const handleVoucherDetails = async (voucherCode: string) => {
    if (!selectedInstance || !selectedCloud) {
      toast.error("Instance and cloud must be selected");
      return;
    }

    setSelectedVoucher(voucherCode);
    setDetailsLoading(true);
    setDetailsDialogOpen(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("No authentication token found");
        return;
      }

      const details = await getVoucherDetailedStats(
        token,
        voucherCode,
        parseInt(selectedInstance),
        parseInt(selectedCloud)
      );

      // Validate the response data
      if (!details || typeof details !== "object") {
        throw new Error("Invalid response format from server");
      }

      setVoucherDetails(details);
    } catch (error) {
      console.error("Error fetching voucher details:", error);
      toast.error("Failed to fetch voucher details. Please try again.");
      setVoucherDetails(null);
    } finally {
      setDetailsLoading(false);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Coupons</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-3 w-24 mb-1" />
                  <Skeleton className="h-3 w-20 mb-1" />
                  <Skeleton className="h-3 w-28" />
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show empty state when no vouchers are available
  if (vouchers.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Coupons</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>
              No vouchers found. Please select an instance and cloud to view
              vouchers.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalPages = pagination
    ? Math.ceil(pagination.count / (pagination.page_size || 20))
    : 0;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Coupons</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {vouchers.map((voucher) => {
              const matchingVoucher = dbVouchers.find(
                (dbVoucher) =>
                  dbVoucher.voucher_code === voucher.voucher_code &&
                  dbVoucher.cloud === voucher.cloud
              );

              const isInDatabase = !!matchingVoucher;

              return (
                <Card
                  key={voucher.voucher_code}
                  className={`transition-all duration-200 hover:shadow-md cursor-pointer ${
                    isInDatabase
                      ? "border-2 border-[var(--color-logo-orange)]"
                      : "border border-border"
                  }`}
                  onClick={() => handleVoucherDetails(voucher.voucher_code)}
                >
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      {/* Voucher Code */}
                      <div className="flex items-center justify-between">
                        <h3 className="font-mono text-sm font-medium break-all">
                          {voucher.voucher_code}
                        </h3>
                        {isInDatabase && (
                          <Badge variant="secondary" className="text-xs">
                            In DB
                          </Badge>
                        )}
                      </div>

                      {/* Voucher Details */}
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex justify-between">
                          <span>Profile:</span>
                          <span className="font-medium">
                            {voucher.profile_name || "Unknown"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Data Limit:</span>
                          <span className="font-medium">
                            {voucher.profile_data_limit_enabled
                              ? `${voucher.profile_data_limit_gb} GB`
                              : "Unlimited"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Speed Limit:</span>
                          <span className="font-medium">
                            {voucher.profile_speed_limit_enabled
                              ? `${voucher.profile_speed_limit_mbs} Mbps`
                              : "Unlimited"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Cost:</span>
                          <span className="font-medium">
                            {voucher.profile_cost}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Created:</span>
                          <span className="font-medium">
                            {formatDate(voucher.created_at)}
                          </span>
                        </div>

                        {/* Database-specific information */}
                        {matchingVoucher?.user && (
                          <div className="flex justify-between">
                            <span>User:</span>
                            <span className="font-medium">
                              {userMap[matchingVoucher.user] || "Unknown"}
                            </span>
                          </div>
                        )}
                        {matchingVoucher?.wallet_address && (
                          <div className="flex justify-between">
                            <span>Wallet:</span>
                            <span className="font-mono text-xs font-medium break-all">
                              {matchingVoucher.wallet_address}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Pagination */}
          {pagination && totalPages > 1 && (
            <div className="mt-6">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (pagination.previous && onPageChange) {
                          onPageChange(pagination.currentPage - 1);
                        }
                      }}
                      className={
                        !pagination.previous
                          ? "pointer-events-none opacity-50"
                          : ""
                      }
                    />
                  </PaginationItem>

                  {/* Page numbers */}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <PaginationItem key={pageNum}>
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (onPageChange) {
                              onPageChange(pageNum);
                            }
                          }}
                          isActive={pagination.currentPage === pageNum}
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}

                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (pagination.next && onPageChange) {
                          onPageChange(pagination.currentPage + 1);
                        }
                      }}
                      className={
                        !pagination.next ? "pointer-events-none opacity-50" : ""
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>

              <div className="text-center text-sm text-muted-foreground mt-2">
                Page {pagination.currentPage} of {totalPages} (
                {pagination.count} total items)
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Voucher Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Voucher Details: {selectedVoucher}</DialogTitle>
            <DialogDescription>
              Detailed usage statistics and session information
            </DialogDescription>
          </DialogHeader>

          {detailsLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ) : voucherDetails ? (
            <div className="space-y-6">
              {/* Usage Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Usage Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Profile</p>
                      <p className="font-medium">
                        {voucherDetails.profile_name || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Usage</p>
                      <p className="font-medium">
                        {voucherDetails.usage_percentage !== null &&
                        voucherDetails.usage_percentage !== undefined
                          ? `${voucherDetails.usage_percentage.toFixed(1)}%`
                          : "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Total Sessions
                      </p>
                      <p className="font-medium">
                        {voucherDetails.total_sessions || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Data Limit
                      </p>
                      <p className="font-medium">
                        {voucherDetails.data_limit_enabled
                          ? `${voucherDetails.data_limit_gb || 0} GB`
                          : "Unlimited"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Data Usage */}
              <Card>
                <CardHeader>
                  <CardTitle>Data Usage</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Data In</p>
                      <p className="font-medium">
                        {voucherDetails.total_data_in !== null &&
                        voucherDetails.total_data_in !== undefined
                          ? formatBytes(voucherDetails.total_data_in)
                          : "0 B"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Data Out</p>
                      <p className="font-medium">
                        {voucherDetails.total_data_out !== null &&
                        voucherDetails.total_data_out !== undefined
                          ? formatBytes(voucherDetails.total_data_out)
                          : "0 B"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Total Data
                      </p>
                      <p className="font-medium">
                        {voucherDetails.total_data_inout !== null &&
                        voucherDetails.total_data_inout !== undefined
                          ? formatBytes(voucherDetails.total_data_inout)
                          : "0 B"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Sessions */}
              {voucherDetails.sessions &&
                voucherDetails.sessions.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Sessions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {voucherDetails.sessions.slice(0, 5).map((session) => (
                          <div
                            key={session.radacctid}
                            className="border rounded-lg p-4"
                          >
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <p className="text-muted-foreground">
                                  Start Time
                                </p>
                                <p className="font-medium">
                                  {formatDate(session.acctstarttime)}
                                </p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">
                                  Duration
                                </p>
                                <p className="font-medium">
                                  {session.acctsessiontime}s
                                </p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Data In</p>
                                <p className="font-medium">
                                  {formatBytes(session.acctinputoctets)}
                                </p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">
                                  Data Out
                                </p>
                                <p className="font-medium">
                                  {formatBytes(session.acctoutputoctets)}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
            </div>
          ) : (
            <div className="text-center text-muted-foreground">
              No detailed information available for this voucher.
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
