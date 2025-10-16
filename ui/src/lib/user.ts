import { createAxiosInstanceWithToken } from "./axiosInstance";
import { User } from "./types";

export const searchUsers = async (
  token: string,
  query: string
): Promise<User[]> => {
  const axiosInstance = createAxiosInstanceWithToken(token);
  const response = await axiosInstance.get(
    `/user/search/?q=${encodeURIComponent(query)}`
  );
  return response.data;
};

export const GetUserById = async (
  token: string,
  userId: number
): Promise<User> => {
  const axiosInstance = createAxiosInstanceWithToken(token);
  const response = await axiosInstance.get(`/user/users/${userId}/`);
  return response.data;
};
