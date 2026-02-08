import { JsonRpcApiProvider } from "ethers";
import { ProcessedTransaction } from "../types";
import { useBlockTransactions } from "../useErigonHooks";

const TX_COUNT = 6;

export const useLatestTransactions = (
  provider: JsonRpcApiProvider,
  latestBlockNumber: number | undefined,
): ProcessedTransaction[] => {
  const { data } = useBlockTransactions(
    provider,
    latestBlockNumber,
    0,
    TX_COUNT,
  );
  return data?.txs ?? [];
};
