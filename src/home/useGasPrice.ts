import { JsonRpcApiProvider } from "ethers";
import useSWR from "swr";

const gasPriceFetcher = async (provider: JsonRpcApiProvider): Promise<bigint> =>
  BigInt(await provider.send("eth_gasPrice", []));

export const useGasPrice = (
  provider: JsonRpcApiProvider,
): bigint | undefined => {
  const { data } = useSWR(["eth_gasPrice", provider], () =>
    gasPriceFetcher(provider), {
    refreshInterval: 12_000,
  });
  return data;
};
