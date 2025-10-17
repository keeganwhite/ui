"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/authContext";
import { listAdminUsers } from "@/lib/adminUsers";
import { AdminUser, AdminUserFilters } from "@/lib/types";
import { UserFilters, UserListTable, EditUserDialog } from "@/components/admin";
import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import ProtectedRoute from "@/lib/ProtectedRoute";
import { toast } from "sonner";

export default function AdminUsersPage() {
  const router = useRouter();
  const { token, isSuperuser, loading: authLoading } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<AdminUserFilters>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    count: 0,
    next: null as string | null,
    previous: null as string | null,
  });
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  // Check if user is superuser
  useEffect(() => {
    if (!authLoading && !isSuperuser) {
      toast.error("Access denied. Superuser privileges required.");
      router.push("/dashboard");
    }
  }, [authLoading, isSuperuser, router]);

  // Fetch users
  const fetchUsers = React.useCallback(async () => {
    if (!token) return;

    setLoading(true);
    try {
      const response = await listAdminUsers(token, filters, currentPage);
      setUsers(response.results);
      setPagination({
        count: response.count,
        next: response.next,
        previous: response.previous,
      });
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [token, filters, currentPage]);

  useEffect(() => {
    if (token && isSuperuser) {
      fetchUsers();
    }
  }, [token, isSuperuser, fetchUsers]);

  const handleUserClick = (user: AdminUser) => {
    setSelectedUser(user);
    setEditDialogOpen(true);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleFiltersChange = (newFilters: AdminUserFilters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleApplyFilters = () => {
    setCurrentPage(1);
    // fetchUsers will be called by useEffect when currentPage changes
  };

  const handleUserUpdated = () => {
    fetchUsers();
  };

  // Show loading skeleton while checking auth
  if (authLoading) {
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
                      <BreadcrumbLink href="/admin/users">Users</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator className="hidden md:block" />
                    <BreadcrumbItem>
                      <BreadcrumbLink href="/admin/users">
                        Management
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
            </header>
            <div className="@container/main w-full max-w-7.5xl flex flex-col gap-6 px-4 lg:px-8 py-8 mx-auto">
              <Skeleton className="h-12 w-64" />
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <Skeleton className="h-96" />
                <div className="lg:col-span-3">
                  <Skeleton className="h-96" />
                </div>
              </div>
            </div>
          </SidebarInset>
        </SidebarProvider>
      </ProtectedRoute>
    );
  }

  // Don't render if not superuser
  if (!isSuperuser) {
    return null;
  }

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
                    <BreadcrumbLink href="/admin/users">Users</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/admin/users">
                      Management
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>

          <div className="@container/main w-full max-w-7.5xl flex flex-col gap-6 px-4 lg:px-8 py-8 mx-auto">
            <h1 className="text-2xl font-bold">User Management</h1>
            <div className="flex flex-1 flex-col">
              <div className="@container/main flex flex-1 flex-col gap-2">
                <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                  {/* Main Content */}
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Filters Sidebar */}
                    <div className="lg:col-span-1">
                      <UserFilters
                        filters={filters}
                        onFiltersChange={handleFiltersChange}
                        onApplyFilters={handleApplyFilters}
                        loading={loading}
                      />
                    </div>

                    {/* Users Table */}
                    <div className="lg:col-span-3">
                      <Card>
                        <CardHeader>
                          <CardTitle>Users</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <UserListTable
                            users={users}
                            loading={loading}
                            pagination={{
                              count: pagination.count,
                              next: pagination.next,
                              previous: pagination.previous,
                              currentPage,
                            }}
                            onUserClick={handleUserClick}
                            onPageChange={handlePageChange}
                          />
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>

      {/* Edit User Dialog */}
      <EditUserDialog
        user={selectedUser}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onUserUpdated={handleUserUpdated}
      />
    </ProtectedRoute>
  );
}
