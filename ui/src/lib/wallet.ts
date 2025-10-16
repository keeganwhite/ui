import { createAxiosInstanceWithToken } from "./axiosInstance";
import {
  WalletDetails,
  Transaction,
  TransactionReceipt,
  TransactionListParams,
  TransactionListResponse,
} from "./types";

export const hasWallet = async (token: string): Promise<boolean> => {
  const axiosInstance = createAxiosInstanceWithToken(token);
  const response = await axiosInstance.get("wallet/has-wallet/");
  return response.data.has_wallet;
};

export const getWalletDetails = async (
  token: string
): Promise<WalletDetails> => {
  const axiosInstance = createAxiosInstanceWithToken(token);
  const response = await axiosInstance.get("wallet/user-wallet-details/");
  const walletData = response.data;
  return {
    address: walletData.address,
    name: walletData.name,
    id: walletData.id,
    symbol: walletData.token,
    token: walletData.token_common_name,
  };
};

export const getWalletBalance = async (
  token: string
): Promise<string | number> => {
  const axiosInstance = createAxiosInstanceWithToken(token);
  const response = await axiosInstance.get("wallet/wallet-balance/");
  return response.data.balance;
};

export const sendTokenAddressPk = async (
  token: string,
  pk: string,
  amount: string | number,
  address: string
): Promise<TransactionReceipt> => {
  const axiosInstance = createAxiosInstanceWithToken(token);
  const response = await axiosInstance.post(`wallet/${pk}/send-token/`, {
    recipient_address: address,
    amount: amount,
  });
  return response.data.transaction_receipt;
};

export const sendTokenUsernamePk = async (
  token: string,
  pk: string,
  amount: string | number,
  username: string
): Promise<TransactionReceipt> => {
  const axiosInstance = createAxiosInstanceWithToken(token);
  const response = await axiosInstance.post(
    `wallet/${pk}/send-token-username/`,
    {
      username: username,
      amount: amount,
    }
  );
  return response.data.transaction_receipt;
};

export const createWallet = async (
  token: string,
  name: string
): Promise<WalletDetails> => {
  const axiosInstance = createAxiosInstanceWithToken(token);
  const response = await axiosInstance.post(`wallet/`, {
    name: name,
  });
  const walletData = response.data;
  return {
    address: walletData.address,
    name: walletData.name,
    id: walletData.id,
    symbol: walletData.token,
    token: walletData.token_common_name,
  };
};

export const getUserTransactions = async (
  token: string,
  params: TransactionListParams = {}
): Promise<TransactionListResponse> => {
  const axiosInstance = createAxiosInstanceWithToken(token);
  const searchParams = new URLSearchParams();

  if (params.page) searchParams.append("page", params.page.toString());
  if (params.page_size)
    searchParams.append("page_size", params.page_size.toString());

  const url = searchParams.toString()
    ? `transaction/by-user/?${searchParams.toString()}`
    : "transaction/by-user/";

  const response = await axiosInstance.get(url);
  return response.data;
};

// New function to get all transactions with pagination
export const getAllTransactions = async (
  token: string,
  params: TransactionListParams = {}
): Promise<TransactionListResponse> => {
  const axiosInstance = createAxiosInstanceWithToken(token);
  const searchParams = new URLSearchParams();

  if (params.page) searchParams.append("page", params.page.toString());
  if (params.page_size)
    searchParams.append("page_size", params.page_size.toString());

  const url = searchParams.toString()
    ? `transaction/?${searchParams.toString()}`
    : "transaction/";

  const response = await axiosInstance.get(url);
  return response.data;
};

// Legacy function for backward compatibility (returns only results array)
export const getUserTransactionsLegacy = async (
  token: string
): Promise<Transaction[]> => {
  const response = await getUserTransactions(token);
  return response.results;
};
