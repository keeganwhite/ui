import { createAxiosInstanceWithToken } from "./axiosInstance";
import {
  RadiusDeskInstance,
  RadiusDeskCloud,
  RadiusDeskRealm,
  RadiusDeskProfile,
  VoucherCreatePayload,
  VoucherCreateResponse,
  RadiusVoucher,
  DatabaseVoucher,
  VoucherSearchParams,
  VoucherListParams,
  PaginatedResponse,
  VoucherDetailedStats,
} from "./types";

export const listRealms = async (
  token: string,
  id: number
): Promise<RadiusDeskRealm[]> => {
  const axiosInstance = createAxiosInstanceWithToken(token);
  const { data } = await axiosInstance.get(`/realms/?cloud=${id}`);
  return data;
};

export const listClouds = async (
  token: string,
  id: number
): Promise<RadiusDeskCloud[]> => {
  const axiosInstance = createAxiosInstanceWithToken(token);
  const response = await axiosInstance.get(`/clouds/?radius_instance=${id}`);
  return response.data;
};

export const listProfiles = async (
  token: string,
  id: number
): Promise<RadiusDeskProfile[]> => {
  const axiosInstance = createAxiosInstanceWithToken(token);
  const response = await axiosInstance.get(`/profiles/?realm=${id}`);
  return response.data;
};

export const listAllRealms = async (
  token: string
): Promise<RadiusDeskRealm[]> => {
  const axiosInstance = createAxiosInstanceWithToken(token);
  const { data } = await axiosInstance.get("/realms/");
  return data;
};

export const listAllClouds = async (
  token: string
): Promise<RadiusDeskCloud[]> => {
  const axiosInstance = createAxiosInstanceWithToken(token);
  const { data } = await axiosInstance.get("/clouds/");
  return data;
};

export const listAllProfiles = async (
  token: string
): Promise<RadiusDeskProfile[]> => {
  const axiosInstance = createAxiosInstanceWithToken(token);
  const { data } = await axiosInstance.get("/profiles/");
  return data;
};

export const listAllRadiusInstances = async (
  token: string
): Promise<RadiusDeskInstance[]> => {
  const axiosInstance = createAxiosInstanceWithToken(token);
  const { data } = await axiosInstance.get("/radiusdesk-instances/");
  return data;
};

export const createVoucher = async (
  token: string,
  data: VoucherCreatePayload
): Promise<VoucherCreateResponse> => {
  const axiosInstance = createAxiosInstanceWithToken(token);
  const response = await axiosInstance.post("/vouchers/add_voucher/", data);
  console.log("Data from creating voucher:", response.data);
  return response.data;
};

export const listVouchers = async (
  token: string
): Promise<DatabaseVoucher[]> => {
  const axiosInstance = createAxiosInstanceWithToken(token);
  const { data } = await axiosInstance.get("/network-admin/vouchers/");
  console.log(`Data from listing vouchers`, data);

  // Handle both old array format and new paginated format
  if (Array.isArray(data)) {
    return data;
  } else if (data && typeof data === "object" && "results" in data) {
    return data.results || [];
  } else {
    return [];
  }
};

// Updated to use new database-first endpoint with pagination
export const listRadiusVouchers = async (
  token: string,
  params: VoucherListParams
): Promise<PaginatedResponse<RadiusVoucher>> => {
  const axiosInstance = createAxiosInstanceWithToken(token);
  const response = await axiosInstance.get(
    "/vouchers/get_all_vouchers_stats_db/",
    {
      params: {
        radius_desk_instance_pk: params.radius_desk_instance_pk,
        radius_desk_cloud_pk: params.radius_desk_cloud_pk,
        page: params.page || 1,
        page_size: params.page_size || 20,
      },
    }
  );
  return response.data;
};

// Updated to use new database-first endpoint with pagination
export const searchVouchers = async (
  token: string,
  params: VoucherSearchParams
): Promise<PaginatedResponse<RadiusVoucher>> => {
  const axiosInstance = createAxiosInstanceWithToken(token);
  const { data } = await axiosInstance.get("/vouchers/search_vouchers/", {
    params: {
      radius_desk_instance_pk: params.radius_desk_instance_pk,
      radius_desk_cloud_pk: params.radius_desk_cloud_pk,
      page: params.page || 1,
      page_size: params.page_size || 20,
      ...(params.username && { username: params.username }),
      ...(params.wallet_address && { wallet_address: params.wallet_address }),
    },
  });
  return data;
};

// New function for detailed voucher stats
export const getVoucherDetailedStats = async (
  token: string,
  voucherCode: string,
  radiusDeskInstancePk: number,
  radiusDeskCloudPk: number
): Promise<VoucherDetailedStats> => {
  const axiosInstance = createAxiosInstanceWithToken(token);
  const { data } = await axiosInstance.get(
    "/vouchers/get_voucher_stats_detailed/",
    {
      params: {
        voucher_code: voucherCode,
        radius_desk_instance_pk: radiusDeskInstancePk,
        radius_desk_cloud_pk: radiusDeskCloudPk,
      },
    }
  );

  // Handle the new response format which returns an array
  if (Array.isArray(data) && data.length > 0) {
    return data[0];
  } else if (Array.isArray(data) && data.length === 0) {
    throw new Error("Voucher not found");
  } else {
    // Handle single object response (fallback)
    return data;
  }
};
