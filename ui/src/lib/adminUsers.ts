import { createAxiosInstanceWithToken } from "./axiosInstance";
import {
  AdminUser,
  AdminUserFilters,
  AdminUserListResponse,
  AdminUserUpdatePayload,
} from "./types";

export const listAdminUsers = async (
  token: string,
  filters?: AdminUserFilters,
  page?: number
): Promise<AdminUserListResponse> => {
  const axiosInstance = createAxiosInstanceWithToken(token);

  // Build query params
  const params: Record<string, string | number | boolean> = {};

  if (page) {
    params.page = page;
  }

  // Backend supports page_size parameter (default: 25, max: 100)
  // Uncomment to customize: params.page_size = 50;

  if (filters) {
    if (filters.has_imsi !== undefined) {
      params.has_imsi = filters.has_imsi;
    }
    if (filters.has_wallet !== undefined) {
      params.has_wallet = filters.has_wallet;
    }
    if (filters.is_active !== undefined) {
      params.is_active = filters.is_active;
    }
    if (filters.is_staff !== undefined) {
      params.is_staff = filters.is_staff;
    }
    if (filters.is_superuser !== undefined) {
      params.is_superuser = filters.is_superuser;
    }
    if (filters.search) {
      params.search = filters.search;
    }
  }

  const response = await axiosInstance.get("/user/admin/users/", {
    params,
  });

  return response.data;
};

export const getAdminUser = async (
  token: string,
  userId: number
): Promise<AdminUser> => {
  const axiosInstance = createAxiosInstanceWithToken(token);
  const response = await axiosInstance.get(`/user/admin/users/${userId}/`);
  return response.data;
};

export const updateAdminUser = async (
  token: string,
  userId: number,
  payload: AdminUserUpdatePayload
): Promise<AdminUser> => {
  const axiosInstance = createAxiosInstanceWithToken(token);
  const response = await axiosInstance.patch(
    `/user/admin/users/${userId}/update/`,
    payload
  );
  return response.data;
};
