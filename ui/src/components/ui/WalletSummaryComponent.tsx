"use client";
import React from "react";

interface WalletSummaryProps {
  balance: string | number;
  name: string;
  walletAddress: string;
  token: string;
  tokenCommonName: string;
  tokenType?: string;
  loading?: boolean;
}

const WalletSummaryComponent: React.FC<WalletSummaryProps> = ({
  balance,
  name,
  walletAddress,
  token,
  tokenCommonName,
  tokenType,
  loading = false,
}) => {
  return (
    <div
      className="bg-[#181A20] rounded-xl shadow-lg p-6 min-w-[320px] max-w-[400px] text-white border border-[#23262F]"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      <div className="mb-4 flex items-center justify-between">
        <span className="text-lg font-semibold tracking-wide">
          Admin Wallet
        </span>
        {tokenType && (
          <span className="text-xs bg-[#23262F] px-2 py-1 rounded text-gray-400">
            {tokenType}
          </span>
        )}
      </div>
      {loading ? (
        <div className="flex justify-center items-center h-24">
          <svg
            className="animate-spin h-8 w-8 text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8z"
            ></path>
          </svg>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Balance</span>
            <span className="text-base font-medium">
              {balance} {token}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Address</span>
            <span className="text-xs font-mono break-all text-gray-200">
              {walletAddress}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Token Name</span>
            <span className="text-base font-medium">{tokenCommonName}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Wallet Name</span>
            <span className="text-base font-medium">{name}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletSummaryComponent;
