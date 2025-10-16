import { createAxiosInstanceWithToken } from "./axiosInstance";
import {
  Device,
  DeviceUptime,
  Network,
  DeviceCreatePayload,
  DeviceUpdatePayload,
  DeviceAggregationData,
} from "./types";

export const fetchDevices = async (
  token: string,
  network_id?: string | number
): Promise<Device[]> => {
  const axiosInstance = createAxiosInstanceWithToken(token);
  const url = network_id ? `/hosts/?network_id=${network_id}` : `/hosts/`;
  const { data } = await axiosInstance.get<Device[]>(url);
  return data;
};

export const fetchAllDevicesDataAggregation = async (
  token: string,
  timeperiod: string,
  network_id?: string | number
): Promise<DeviceAggregationData[]> => {
  const axiosInstance = createAxiosInstanceWithToken(token);
  let url = `/network/up-time/?period=${timeperiod}`;
  if (network_id) {
    url += `&network_id=${network_id}`;
  }
  const { data } = await axiosInstance.get<DeviceAggregationData[]>(url);
  return data;
};

export const fetchDeviceUptimeData = async (
  token: string,
  host_id: string | number,
  period: number,
  network_id?: string | number
): Promise<DeviceUptime[]> => {
  const axiosInstance = createAxiosInstanceWithToken(token);
  let url = `/network/device-uptime/?host_id=${host_id}&period=${encodeURIComponent(
    `${period} minutes`
  )}`;
  if (network_id) {
    url += `&network_id=${network_id}`;
  }
  const { data } = await axiosInstance.get<DeviceUptime[]>(url);
  console.log("[fetchDeviceUptimeData] data", data);
  return data;
};

export const updateDevice = async (
  token: string,
  deviceId: string | number,
  payload: DeviceUpdatePayload
): Promise<Device> => {
  const axiosInstance = createAxiosInstanceWithToken(token);
  const { data } = await axiosInstance.put<Device>(
    `/hosts/${deviceId}/`,
    payload
  );
  return data;
};

export const createDevice = async (
  token: string,
  payload: DeviceCreatePayload
): Promise<Device> => {
  const axiosInstance = createAxiosInstanceWithToken(token);
  const { data } = await axiosInstance.post<Device>(`/hosts/`, payload);
  return data;
};

export const deleteDevice = async (
  token: string,
  deviceId: string | number
): Promise<{ success: boolean; message?: string }> => {
  const axiosInstance = createAxiosInstanceWithToken(token);
  const { data } = await axiosInstance.delete<{
    success: boolean;
    message?: string;
  }>(`/hosts/${deviceId}/`);
  return data;
};

export const fetchNetworks = async (token: string): Promise<Network[]> => {
  const axiosInstance = createAxiosInstanceWithToken(token);
  const { data } = await axiosInstance.get<Network[]>("/networks/");
  return data;
};
