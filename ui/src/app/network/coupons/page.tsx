"use client";

import React, { useState, useEffect, useCallback } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import ProtectedRoute from "@/lib/ProtectedRoute";
import {
  CreateVoucherDialog,
  RadiusVoucherSelector,
  RadiusVoucherList,
} from "@/components/coupons";
import {
  RadiusVoucher,
  DatabaseVoucher,
  RadiusDeskInstance,
  RadiusDeskCloud,
  PaginatedResponse,
} from "@/lib/types";
import {
  listAllRadiusInstances,
  listClouds,
  listRadiusVouchers,
  searchVouchers,
  listVouchers,
} from "@/lib/radiusdesk";
import { GetUserById } from "@/lib/user";
import { toast } from "sonner";

export default function NetworkCouponsPage() {
  // Main state
  const [vouchers, setVouchers] = useState<RadiusVoucher[]>([]);
  const [loading, setLoading] = useState(false);

  // Pagination state
  const [pagination, setPagination] = useState<
    | {
        count: number;
        next: string | null;
        previous: string | null;
        currentPage: number;
        page_size: number;
      }
    | undefined
  >(undefined);

  // RADIUSDesk instances and clouds
  const [radiusInstances, setRadiusInstances] = useState<RadiusDeskInstance[]>(
    []
  );
  const [clouds, setClouds] = useState<RadiusDeskCloud[]>([]);
  const [selectedInstance, setSelectedInstance] = useState<string>("");
  const [selectedCloud, setSelectedCloud] = useState<string>("");

  // Search and filter state
  const [voucherLimit, setVoucherLimit] = useState<number>(50);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchType, setSearchType] = useState<"username" | "wallet">(
    "username"
  );
  const [pageSize, setPageSize] = useState<number>(20);

  // Database vouchers and user mapping
  const [dbVouchers, setDbVouchers] = useState<DatabaseVoucher[]>([]);
  const [userMap, setUserMap] = useState<Record<number, string>>({});

  // Fetch RADIUSDesk instances on mount
  useEffect(() => {
    const fetchInstances = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          toast.error("No authentication token found");
          return;
        }
        const instances = await listAllRadiusInstances(token);
        setRadiusInstances(instances);
        if (instances.length > 0) {
          setSelectedInstance(instances[0].id.toString());
        }
      } catch (error) {
        console.error("Error fetching RADIUSDesk instances:", error);
        toast.error("Failed to fetch RADIUSDesk instances");
      }
    };

    fetchInstances();
  }, []);

  // Fetch clouds when instance changes
  useEffect(() => {
    if (!selectedInstance) {
      setClouds([]);
      setSelectedCloud("");
      return;
    }

    const fetchClouds = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const cloudsData = await listClouds(token, parseInt(selectedInstance));
        setClouds(cloudsData);
        if (cloudsData.length > 0) {
          setSelectedCloud(cloudsData[0].id.toString());
        }
      } catch (error) {
        console.error("Error fetching clouds:", error);
        toast.error("Failed to fetch clouds");
      }
    };

    fetchClouds();
  }, [selectedInstance]);

  // Fetch profiles and database vouchers on mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        // Fetch database vouchers
        const dbVoucherData = await listVouchers(token);
        setDbVouchers(dbVoucherData);

        // Extract unique user IDs and fetch user details
        const userIds = [
          ...new Set(
            dbVoucherData.map((voucher) => voucher.user).filter(Boolean)
          ),
        ];

        const userMapData: Record<number, string> = {};
        await Promise.all(
          userIds.map(async (userId) => {
            if (userId) {
              try {
                const userResponse = await GetUserById(token, userId);
                userMapData[userId] = userResponse.username;
              } catch (error) {
                console.error(`Error fetching user ${userId}:`, error);
                userMapData[userId] = "Unknown";
              }
            }
          })
        );
        setUserMap(userMapData);
      } catch (error) {
        console.error("Error fetching initial data:", error);
        toast.error("Failed to fetch initial data");
      }
    };

    fetchInitialData();
  }, []);

  // Fetch vouchers when instance/cloud changes or search is performed
  const fetchVouchers = useCallback(
    async (page = 1) => {
      if (!selectedInstance || !selectedCloud) {
        setVouchers([]);
        setPagination(undefined);
        return;
      }

      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          toast.error("No authentication token found");
          return;
        }

        let response: PaginatedResponse<RadiusVoucher>;

        if (searchQuery.trim()) {
          // Search vouchers with pagination
          const searchParams = {
            radius_desk_instance_pk: parseInt(selectedInstance),
            radius_desk_cloud_pk: parseInt(selectedCloud),
            page,
            page_size: pageSize,
            ...(searchType === "username"
              ? { username: searchQuery }
              : { wallet_address: searchQuery }),
          };
          response = await searchVouchers(token, searchParams);
        } else {
          // List all vouchers with pagination
          const listParams = {
            radius_desk_instance_pk: parseInt(selectedInstance),
            radius_desk_cloud_pk: parseInt(selectedCloud),
            page,
            page_size: pageSize,
          };
          response = await listRadiusVouchers(token, listParams);
        }

        setVouchers(response.results);
        setPagination({
          count: response.count,
          next: response.next,
          previous: response.previous,
          currentPage: page,
          page_size: pageSize,
        });
        // setDatabaseCloudId(parseInt(selectedCloud)); // This line is removed
      } catch (error) {
        console.error("Error fetching vouchers:", error);
        toast.error("Failed to fetch vouchers");
        setVouchers([]);
        setPagination(undefined);
      } finally {
        setLoading(false);
      }
    },
    [selectedInstance, selectedCloud, searchQuery, searchType, pageSize]
  );

  // Fetch vouchers when dependencies change
  useEffect(() => {
    fetchVouchers(1);
  }, [fetchVouchers]);

  // Handle page change
  const handlePageChange = (page: number) => {
    fetchVouchers(page);
  };

  // Handle page size change
  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    // Reset to page 1 when changing page size
    setTimeout(() => fetchVouchers(1), 0);
  };

  const handleVoucherCreated = () => {
    // Refresh vouchers when a new voucher is created
    fetchVouchers(1);
  };

  return (
    <ProtectedRoute>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator
                orientation="vertical"
                className="mr-2 data-[orientation=vertical]:h-4"
              />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink href="/network/coupons">
                      Network
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/network/coupons">
                      Internet Coupons
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>
          <div className="@container/main w-full max-w-7.5xl flex flex-col gap-6 px-4 lg:px-8 py-8 mx-auto">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">Internet Coupons</h1>
              <CreateVoucherDialog onVoucherCreated={handleVoucherCreated} />
            </div>
            <div className="flex flex-1 flex-col gap-6">
              <div className="@container/main flex flex-1 flex-col gap-2">
                <div className="flex flex-col gap-6">
                  <p className="text-muted-foreground">
                    Manage and distribute internet access coupons for your
                    network. Create new coupons and view existing ones with
                    their usage statistics.
                  </p>

                  {/* Voucher Selector */}
                  <RadiusVoucherSelector
                    radiusInstances={radiusInstances}
                    clouds={clouds}
                    selectedInstance={selectedInstance}
                    selectedCloud={selectedCloud}
                    voucherLimit={voucherLimit}
                    searchQuery={searchQuery}
                    searchType={searchType}
                    pageSize={pageSize}
                    onInstanceChange={setSelectedInstance}
                    onCloudChange={setSelectedCloud}
                    onVoucherLimitChange={setVoucherLimit}
                    onSearchQueryChange={setSearchQuery}
                    onSearchTypeChange={setSearchType}
                    onPageSizeChange={handlePageSizeChange}
                    onSearch={() => fetchVouchers(1)}
                    loading={loading}
                  />

                  {/* Voucher List */}
                  <RadiusVoucherList
                    vouchers={vouchers}
                    dbVouchers={dbVouchers}
                    userMap={userMap}
                    loading={loading}
                    pagination={pagination}
                    onPageChange={handlePageChange}
                    selectedInstance={selectedInstance}
                    selectedCloud={selectedCloud}
                  />
                </div>
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </ProtectedRoute>
  );
}
