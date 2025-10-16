import { createAxiosInstanceWithToken } from "./axiosInstance";
import { Device, DeviceUptime, DeviceAggregation } from "./types";

// Re-export functions from network.ts for consistency
export {
  fetchDevices,
  fetchNetworks,
  updateDevice,
  createDevice,
  deleteDevice,
  fetchAllDevicesDataAggregation,
  fetchDeviceUptimeData,
} from "./network";

// Additional functions that might be needed for device management
export const updateDeviceByIdentifier = async (
  token: string,
  payload: {
    mac_address?: string;
    ip_address?: string;
    network: string;
    [key: string]: unknown;
  }
): Promise<Device> => {
  const axiosInstance = createAxiosInstanceWithToken(token);
  const { data } = await axiosInstance.put<Device>(
    "/hosts/update-by-identifier/",
    payload
  );
  return data;
};

export const deleteDeviceByIdentifier = async (
  token: string,
  payload: {
    mac_address?: string;
    ip_address?: string;
    network: string;
  }
): Promise<{ message: string }> => {
  const axiosInstance = createAxiosInstanceWithToken(token);
  const { data } = await axiosInstance.delete<{ message: string }>(
    "/hosts/delete-by-identifier/",
    {
      data: payload,
    }
  );
  return data;
};

export const fetchPingAggregates = async (
  token: string,
  params: {
    host_ids?: string;
    aggregation?: string;
    network_id?: string | number;
  }
): Promise<DeviceAggregation[]> => {
  const axiosInstance = createAxiosInstanceWithToken(token);
  const queryParams = new URLSearchParams();

  if (params.host_ids) queryParams.append("host_ids", params.host_ids);
  if (params.aggregation) queryParams.append("aggregation", params.aggregation);
  if (params.network_id)
    queryParams.append("network_id", params.network_id.toString());

  const url = `/ping-aggregates/?${queryParams.toString()}`;
  const { data } = await axiosInstance.get<DeviceAggregation[]>(url);
  return data;
};

export const fetchAggregateUptime = async (
  token: string,
  params: {
    period?: string;
    min_pings?: number;
    host_ids?: string;
    network_id?: string | number;
  }
): Promise<DeviceAggregation[]> => {
  const axiosInstance = createAxiosInstanceWithToken(token);
  const queryParams = new URLSearchParams();

  if (params.period) queryParams.append("period", params.period);
  if (params.min_pings)
    queryParams.append("min_pings", params.min_pings.toString());
  if (params.host_ids) queryParams.append("host_ids", params.host_ids);
  if (params.network_id)
    queryParams.append("network_id", params.network_id.toString());

  const url = `/network/up-time/?${queryParams.toString()}`;
  const { data } = await axiosInstance.get<DeviceAggregation[]>(url);
  return data;
};

export const fetchDeviceUptimeLine = async (
  token: string,
  params: {
    host_id: string | number;
    period?: string;
    network_id?: string | number;
  }
): Promise<DeviceUptime[]> => {
  const axiosInstance = createAxiosInstanceWithToken(token);
  const queryParams = new URLSearchParams();

  queryParams.append("host_id", params.host_id.toString());
  if (params.period) queryParams.append("period", params.period);
  if (params.network_id)
    queryParams.append("network_id", params.network_id.toString());

  const url = `/network/device-uptime/?${queryParams.toString()}`;
  const { data } = await axiosInstance.get<DeviceUptime[]>(url);
  return data;
};

export const ingestUptimeData = async (
  token: string,
  payload: {
    network: number;
    network_admin: string;
    data: Array<{
      host: number;
      is_alive: boolean;
      timestamp?: string;
    }>;
  }
): Promise<{ created: number[]; errors: string[] }> => {
  const axiosInstance = createAxiosInstanceWithToken(token);
  const { data } = await axiosInstance.post<{
    created: number[];
    errors: string[];
  }>("/network/ingest-uptime-data/", payload);
  return data;
};
