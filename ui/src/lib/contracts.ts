import { createAxiosInstanceWithToken } from "./axiosInstance";
import { Contract } from "./types";

export const listContracts = async (token: string): Promise<Contract[]> => {
  const axiosInstance = createAxiosInstanceWithToken(token);
  const response = await axiosInstance.get("contract/");
  const contracts = response.data;
  return contracts.map((contract: Contract) => ({
    id: contract.id,
    name: contract.name,
    address: contract.address,
    contract_type: contract.contract_type,
    description: contract.description,
    read_access: contract.read_access,
    write_access: contract.write_access,
    user: contract.user,
  }));
};
