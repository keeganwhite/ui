"use client";
import {
  createAxiosInstance,
  createAxiosInstanceWithToken,
} from "./axiosInstance";

export interface LoginResponse {
  token: string;
  refreshToken: string;
  expiresIn: number;
}

export interface UserProfile {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  phone_number: string | null;
  radiusdesk_username: string | null;
  radiusdesk_password: string | null;
  imsi: string | null;
  product_id_data: string | null;
  product_id_cents: string | null;
  is_active: boolean;
  is_staff: boolean;
  is_superuser: boolean;
}

export const loginUser = async (
  username: string,
  password: string
): Promise<LoginResponse> => {
  const axiosInstance = createAxiosInstance();
  const response = await axiosInstance.post("user/network-admin/login/", {
    username,
    password,
  });

  const token = response.data.token;
  const refreshToken = response.data.refresh_token;
  const expiresIn = response.data.expires_in;
  const logInData: LoginResponse = {
    token,
    refreshToken,
    expiresIn,
  };
  return logInData;
};

export const getUserProfile = async (token: string): Promise<UserProfile> => {
  const axiosInstance = createAxiosInstanceWithToken(token);
  const response = await axiosInstance.get("user/me/");
  return response.data;
};

export const getToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token");
  }
  return null;
};

export const logoutUser = (): void => {
  if (typeof window !== "undefined") {
    localStorage.clear();
  }
};
