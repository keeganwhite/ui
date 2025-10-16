import { createAxiosInstanceWithToken } from "./axiosInstance";
import {
  Reward,
  RewardCreatePayload,
  RewardUpdatePayload,
  UptimeRewardTransaction,
} from "./types";

/**
 * Fetch all rewards
 */
export const listRewards = async (token: string): Promise<Reward[]> => {
  const axiosInstance = createAxiosInstanceWithToken(token);
  try {
    const { data } = await axiosInstance.get<Reward[]>(`/rewards/`);
    return data;
  } catch (error) {
    console.error("Error fetching rewards:", error);
    throw error;
  }
};

/**
 * Fetch rewards for the authenticated user
 */
export const listRewardsByUser = async (token: string): Promise<Reward[]> => {
  const axiosInstance = createAxiosInstanceWithToken(token);
  try {
    const { data } = await axiosInstance.get<Reward[]>(`/rewards/by-user/`);
    return data;
  } catch (error) {
    console.error("Error fetching rewards by user:", error);
    throw error;
  }
};

/**
 * Fetch rewards filtered by type
 */
export const listRewardsByType = async (
  token: string,
  rewardType: "uptime" | "custom"
): Promise<Reward[]> => {
  const axiosInstance = createAxiosInstanceWithToken(token);
  try {
    const { data } = await axiosInstance.get<Reward[]>(`/rewards/by-type/`, {
      params: { reward_type: rewardType },
    });
    return data;
  } catch (error) {
    console.error("Error fetching rewards by type:", error);
    throw error;
  }
};

/**
 * Create a new reward
 */
export const createReward = async (
  token: string,
  payload: RewardCreatePayload
): Promise<{ message: string; reward_id: number }> => {
  const axiosInstance = createAxiosInstanceWithToken(token);

  try {
    const { data } = await axiosInstance.post(`/rewards/setup/`, payload);
    return data;
  } catch (error) {
    console.error("Error creating reward:", error);
    throw error;
  }
};

/**
 * Cancel a reward
 */
export const cancelReward = async (
  token: string,
  rewardId: number
): Promise<{ message: string }> => {
  const axiosInstance = createAxiosInstanceWithToken(token);
  try {
    const { data } = await axiosInstance.post(`/rewards/${rewardId}/cancel/`);
    return data;
  } catch (error) {
    console.error("Error canceling reward:", error);
    throw error;
  }
};

/**
 * Fetch all reward transactions
 */
export const listRewardsTransactions = async (
  token: string
): Promise<UptimeRewardTransaction[]> => {
  const axiosInstance = createAxiosInstanceWithToken(token);
  try {
    const { data } = await axiosInstance.get<UptimeRewardTransaction[]>(
      `/uptime-transactions/`
    );
    return data;
  } catch (error) {
    console.error("Error fetching reward transactions:", error);
    throw error;
  }
};

/**
 * Fetch reward transactions for a specific user
 */
export const listRewardsTransactionsByUser = async (
  token: string
): Promise<UptimeRewardTransaction[]> => {
  const axiosInstance = createAxiosInstanceWithToken(token);
  try {
    const { data } = await axiosInstance.get<UptimeRewardTransaction[]>(
      `/uptime-transactions/by-user/`
    );
    return data;
  } catch (error) {
    console.error("Error fetching reward transactions by user:", error);
    throw error;
  }
};

/**
 * Delete a reward
 */
export const deleteReward = async (
  token: string,
  rewardId: number
): Promise<{ message: string }> => {
  const axiosInstance = createAxiosInstanceWithToken(token);
  try {
    const { data } = await axiosInstance.delete(`/rewards/${rewardId}/`);
    return data;
  } catch (error) {
    console.error("Error deleting reward:", error);
    throw error;
  }
};

/**
 * Activate a reward
 */
export const activateReward = async (
  token: string,
  rewardId: number
): Promise<{ message: string }> => {
  const axiosInstance = createAxiosInstanceWithToken(token);
  try {
    const { data } = await axiosInstance.post(`/rewards/${rewardId}/activate/`);
    return data;
  } catch (error) {
    console.error("Error activating reward:", error);
    throw error;
  }
};

/**
 * Update a reward
 */
export const updateReward = async (
  token: string,
  rewardId: number,
  payload: RewardUpdatePayload
): Promise<Reward> => {
  const axiosInstance = createAxiosInstanceWithToken(token);
  try {
    const { data } = await axiosInstance.put<Reward>(
      `/rewards/${rewardId}/`,
      payload
    );
    return data;
  } catch (error) {
    console.error("Error updating reward:", error);
    throw error;
  }
};
