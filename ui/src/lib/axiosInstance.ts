"use client";
import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8100/api/v1";

export const createAxiosInstance = (): AxiosInstance => {
  return axios.create({
    baseURL: API_BASE_URL,
  });
};

export const createAxiosInstanceWithToken = (token: string): AxiosInstance => {
  const instance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  let isRefreshing = false;
  let refreshSubscribers: Array<(newToken: string) => void> = [];

  const onTokenRefreshed = (newToken: string) => {
    refreshSubscribers.forEach((callback) => callback(newToken));
    refreshSubscribers = [];
  };

  const addRefreshSubscriber = (callback: (newToken: string) => void) => {
    refreshSubscribers.push(callback);
  };

  instance.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as AxiosRequestConfig & {
        _retry?: boolean;
      };
      if (
        error.response &&
        (error.response.status === 401 || error.response.status === 403) &&
        !originalRequest._retry
      ) {
        originalRequest._retry = true;
        console.log("[axiosInstance] Refreshing token");
        const refreshToken = localStorage.getItem("refreshToken");
        if (refreshToken) {
          if (!isRefreshing) {
            isRefreshing = true;
            try {
              const refreshResponse = await axios.post(
                `${API_BASE_URL}/user/refresh/`,
                { refresh_token: refreshToken }
              );
              console.log("[axiosInstance] Refreshed token", refreshResponse);
              const newToken = refreshResponse.data.access_token;
              const newRefreshToken = refreshResponse.data.refresh_token;
              localStorage.setItem("refreshToken", newRefreshToken);
              localStorage.setItem("token", newToken);
              onTokenRefreshed(newToken);
              if (originalRequest.headers)
                originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
              isRefreshing = false;
              return axios(originalRequest);
            } catch (refreshError) {
              console.error(
                "[axiosInstance] Failed to refresh token:",
                refreshError
              );
              localStorage.clear();
              window.location.href = "/";
            }
          }
          return new Promise((resolve) => {
            addRefreshSubscriber((newToken: string) => {
              if (originalRequest.headers)
                originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
              resolve(axios(originalRequest));
            });
          });
        } else {
          console.warn("No refresh token available");
          localStorage.clear();
          window.location.href = "/";
        }
      }
      return Promise.reject(error);
    }
  );

  return instance;
};
