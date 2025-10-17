export interface WalletDetails {
  address: string;
  name: string;
  id: string | number;
  symbol: string;
  token: string;
}

export type Contract = {
  address: string;
  contract_type: string;
  description: string;
  id: string | number;
  name: string;
  read_access: boolean;
  write_access: boolean;
  user: string | number;
};

export interface Network {
  id: number;
  name: string;
  created_at: string; // ISO date string
  admin: number;
}

export interface UserDetail {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  phone_number: string | null;
}

export interface Device {
  id: number;
  name: string;
  ip_address: string;
  mac_address: string | null;
  device_type: string;
  user: number | null;
  user_detail: UserDetail | null;
  radiusdesk_instance: unknown;
  cloud: unknown;
  realm: unknown;
  network: number;
}

export interface DeviceUptime {
  bucket: string; // ISO date string
  uptime_percentage: number;
  total_pings: number;
}

export interface DeviceAggregation {
  period: string;
  total_uptime: number;
  device_count: number;
  [key: string]: unknown;
}

export interface DeviceCreatePayload {
  name: string;
  ip_address: string;
  mac_address: string;
  network_id: string | number;
  [key: string]: unknown;
}

export interface DeviceUpdatePayload {
  name?: string;
  ip_address?: string;
  mac_address?: string;
  network_id?: string | number;
  network?: number;
  device_type?: string;
  user?: number | null;
  [key: string]: unknown;
}

// Transaction Category Enum
export type TransactionCategory =
  | "TRANSFER"
  | "INTERNET_COUPON"
  | "REWARD"
  | "PAYMENT"
  | "OTHER";

// User Type for transactions
export interface TransactionUser {
  username: string;
}

export interface Transaction {
  id: number;
  sender: TransactionUser | null;
  recipient: TransactionUser | null;
  recipient_address: string | null;
  sender_address: string | null;
  amount: string;
  transaction_hash: string | null;
  block_number: string | null;
  block_hash: string | null;
  gas_used: string | null;
  category: TransactionCategory | null;
  timestamp: string;
  token: string | null;
  created_at?: string; // ISO datetime string
}

export interface TransactionReceipt {
  blockHash: string;
  blockNumber: string;
  gasUsed: string;
  status: number;
  transactionHash: string;
  transactionIndex: string;
}

export type UserDetailType = "username" | "walletAddress";

export interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  walletBalance: string | number | null;
  walletId: string | number;
  tokenSymbol: string;
  onTransactionComplete: () => void;
}

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

// RADIUSDesk Types
export interface RadiusDeskInstance {
  id: number;
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface RadiusDeskCloud {
  id: number;
  name: string;
  description?: string;
  radius_instance: number;
  created_at?: string;
  updated_at?: string;
}

export interface RadiusDeskRealm {
  id: number;
  name: string;
  description?: string;
  cloud: number;
  created_at?: string;
  updated_at?: string;
}

export interface RadiusDeskProfile {
  id: number;
  name: string;
  description?: string;
  realm: number;
  radius_desk_id?: number;
  created_at?: string;
  updated_at?: string;
}

export interface VoucherCreatePayload {
  radius_desk_instance_pk: number;
  radius_desk_profile_pk: number;
  radius_desk_cloud_pk: number;
  radius_desk_realm_pk: number;
}

export interface VoucherCreateResponse {
  voucher: string;
  success: boolean;
  message?: string;
}

export interface RadiusVoucher {
  id: number;
  radius_desk_instance_name: string;
  profile_name: string;
  profile_data_limit_gb: number;
  profile_data_limit_enabled: boolean;
  profile_speed_limit_mbs: number;
  profile_speed_limit_enabled: boolean;
  profile_cost: number;
  voucher_code: string;
  wallet_address: string | null;
  created_at: string;
  realm: number;
  cloud: number;
  radius_desk_instance: number;
  user: number | null;
}

export interface DatabaseVoucher {
  id: number;
  voucher_code: string;
  cloud: number;
  user: number | null;
  wallet_address: string | null;
  created_at: string;
  updated_at: string;
}

export interface VoucherSearchParams {
  radius_desk_instance_pk: number;
  radius_desk_cloud_pk: number;
  limit?: number;
  username?: string;
  wallet_address?: string;
  page?: number;
  page_size?: number;
}

export interface VoucherListParams {
  radius_desk_instance_pk: number;
  radius_desk_cloud_pk: number;
  limit?: number;
  page?: number;
  page_size?: number;
}

// New paginated response types
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// New detailed voucher stats interface
export interface VoucherDetailedStats {
  voucher_code: string;
  profile_name: string;
  data_limit_gb: number;
  data_limit_enabled: boolean;
  usage_percentage: number | null;
  total_sessions: number;
  total_data_in: string | number | null;
  total_data_out: string | number | null;
  total_data_inout: string | number | null;
  sessions: VoucherSession[];
}

export interface VoucherSession {
  radacctid: number;
  acctsessionid: string;
  username: string;
  acctstarttime: string;
  acctstoptime: string;
  acctsessiontime: number;
  acctinputoctets: number;
  acctoutputoctets: number;
}

export type SearchType = "username" | "wallet";

export interface CreateVoucherDialogProps {
  onVoucherCreated?: () => void;
}

export interface RadiusVoucherSelectorProps {
  radiusInstances: RadiusDeskInstance[];
  clouds: RadiusDeskCloud[];
  selectedInstance: string;
  selectedCloud: string;
  voucherLimit: number;
  searchQuery: string;
  searchType: SearchType;
  pageSize: number;
  onInstanceChange: (instance: string) => void;
  onCloudChange: (cloud: string) => void;
  onVoucherLimitChange: (limit: number) => void;
  onSearchQueryChange: (query: string) => void;
  onSearchTypeChange: (type: SearchType) => void;
  onPageSizeChange: (size: number) => void;
  onSearch: () => void;
  loading: boolean;
}

export interface CreateRadiusVoucherProps {
  onVoucherCreated?: () => void;
}

export interface RadiusVoucherListProps {
  vouchers: RadiusVoucher[];
  dbVouchers: DatabaseVoucher[];
  userMap: Record<number, string>;
  loading: boolean;
  pagination?: {
    count: number;
    next: string | null;
    previous: string | null;
    currentPage: number;
    page_size: number;
  };
  onPageChange?: (page: number) => void;
  selectedInstance?: string;
  selectedCloud?: string;
}

export interface DeviceUptimeLineData {
  bucket: string;
  uptime_percentage: number;
  total_pings: number;
}

export interface PingAggregateData {
  bucket: string;
  host_id: number;
  uptime_percentage: number;
  total_pings: number;
}

export interface DeviceIdentifierPayload {
  mac_address?: string;
  ip_address?: string;
  network: string;
  [key: string]: unknown;
}

export interface IngestUptimeDataPayload {
  network: number;
  network_admin: string;
  data: Array<{
    host: number;
    is_alive: boolean;
    timestamp?: string;
  }>;
}

export interface IngestUptimeDataResponse {
  created: number[];
  errors: string[];
}

export interface DeviceUpdateByIdentifierPayload
  extends DeviceIdentifierPayload {
  name?: string;
  device_type?: string;
  [key: string]: unknown;
}

export interface DeviceDeleteByIdentifierPayload {
  mac_address?: string;
  ip_address?: string;
  network: string;
}

export interface PingAggregatesParams {
  host_ids?: string;
  aggregation?:
    | "15m"
    | "60m"
    | "6h"
    | "12h"
    | "24h"
    | "7d"
    | "30d"
    | "90d"
    | "365d";
  network_id?: string | number;
}

export interface AggregateUptimeParams {
  period?: string;
  min_pings?: number;
  host_ids?: string;
  network_id?: string | number;
}

export interface DeviceUptimeLineParams {
  host_id: string | number;
  period?: string;
  network_id?: string | number;
}

// Monitoring page types
export interface DeviceAggregationData {
  host_id: number;
  uptime_percentage: number;
  total_pings: number;
  period?: string;
}

export interface ChartDataPoint {
  name: string;
  uptime_percentage: number;
  total_pings: number;
  host_id: number;
}

export interface TimePeriodOption {
  label: string;
  value: string;
}

export interface MonitoringPageProps {
  networkId?: string | number;
}

export interface UptimeBarChartProps {
  networkId?: string | number;
}

export interface DeviceUptimeLineChartProps {
  networkId?: string | number;
}

// Reward Types
export interface Reward {
  id: number;
  name: string;
  user: number | null;
  device: number | null;
  reward_type: "uptime" | "custom";
  reward_amount: number;
  once_off: boolean;
  interval_minutes: number | null;
  is_cancelled: boolean;
  celery_task_id: string | null;
  network: number | null;
  created_at: string;
  updated_at: string;
}

export interface RewardCreatePayload {
  name: string;
  user: number | null;
  device: number | null;
  reward_type: "uptime" | "custom";
  reward_amount: number;
  once_off: boolean;
  interval_minutes: number | null;
  network?: number;
}

export interface RewardUpdatePayload {
  name?: string;
  user?: number | null;
  device?: number | null;
  reward_type?: "uptime" | "custom";
  reward_amount?: number;
  interval_minutes?: number | null;
}

export interface UptimeRewardTransaction {
  id: number;
  reward: number;
  amount: string;
  transaction_hash: string | null;
  block_number: string | null;
  block_hash: string | null;
  gas_used: string | null;
  timestamp: string;
  status: "pending" | "completed" | "failed";
}

export interface RewardListProps {
  rewards: Reward[];
  onEdit: (reward: Reward) => void;
  onDelete: (reward: Reward) => void;
  refreshRewards: () => void;
  loading: boolean;
}

export interface RewardItemProps {
  reward: Reward;
  onEdit: (reward: Reward) => void;
  onDelete: (reward: Reward) => void;
  refreshRewards: () => void;
}

export interface AddRewardDialogProps {
  open: boolean;
  onClose: () => void;
  refreshRewards: () => void;
}

export interface EditRewardDialogProps {
  open: boolean;
  onClose: () => void;
  reward: Reward | null;
  refreshRewards: () => void;
}

export interface DeleteRewardDialogProps {
  open: boolean;
  onClose: () => void;
  rewardId: number | null;
  refreshRewards: () => void;
}

export interface RewardTypeOption {
  value: "uptime" | "custom";
  label: string;
}

export interface IntervalOption {
  label: string;
  value: number;
}

// Transaction API Parameters
export interface TransactionListParams {
  page?: number;
  page_size?: number;
}

// Transaction List Response
export type TransactionListResponse = PaginatedResponse<Transaction>;

// API Service Interface
export interface TransactionApiService {
  getTransactions(
    params?: TransactionListParams
  ): Promise<TransactionListResponse>;
  getUserTransactions(
    params?: TransactionListParams
  ): Promise<TransactionListResponse>;
  getTransaction(id: number): Promise<Transaction>;
}

// Hook Return Types
export interface UseTransactionsReturn {
  transactions: Transaction[];
  pagination: {
    count: number;
    next: string | null;
    previous: string | null;
  };
  loading: boolean;
  error: string | null;
  fetchTransactions: (params?: TransactionListParams) => Promise<void>;
  nextPage: () => void;
  previousPage: () => void;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  currentPage: number;
  totalPages: number;
}

// Admin User Management Types
export interface AdminUser {
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
  has_imsi: boolean;
  has_wallet: boolean;
  wallet_address: string | null;
}

export interface AdminUserFilters {
  has_imsi?: boolean;
  has_wallet?: boolean;
  is_active?: boolean;
  is_staff?: boolean;
  is_superuser?: boolean;
  search?: string;
}

export interface AdminUserListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: AdminUser[];
}

export interface AdminUserUpdatePayload {
  email?: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  radiusdesk_username?: string;
  radiusdesk_password?: string;
  imsi?: string;
  product_id_data?: string;
  product_id_cents?: string;
  is_active?: boolean;
  is_staff?: boolean;
  is_superuser?: boolean;
  password?: string;
}
