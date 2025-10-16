"use client";
import { createAxiosInstance } from "./axiosInstance";

export interface LoginResponse {
  token: string;
  refreshToken: string;
  expiresIn: number;
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
