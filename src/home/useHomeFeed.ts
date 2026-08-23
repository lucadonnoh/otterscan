import { Block, JsonRpcApiProvider } from "ethers";
import { useEffect, useRef, useState } from "react";
import { ProcessedTransaction } from "../types";
import {
  BlockTransactionsPage,
  readBlockTransactions,
} from "../useErigonHooks";
import { useLatestBlockNumber } from "../useLatestBlock";
import { recentBlockNumbers } from "./homeFormatters";

export const HOME_BLOCK_COUNT = 6;
export const HOME_TRANSACTION_COUNT = 6;

export type HomeBlockSummary = {
  number: number;
  timestamp: number;
  feeRecipient: string;
  transactionCount: number;
  gasUsed: bigint;
  gasLimit: bigint;
  baseFeePerGas: bigint | null;
};

const summarizeBlock = (block: Block): HomeBlockSummary => ({
  number: block.number,
  timestamp: block.timestamp,
  feeRecipient: block.miner,
  transactionCount: block.transactions.length,
  gasUsed: block.gasUsed,
  gasLimit: block.gasLimit,
  baseFeePerGas: block.baseFeePerGas,
});

export type HomeFeed = {
  latestBlockNumber: number | undefined;
  blocks: HomeBlockSummary[] | undefined;
  transactions: ProcessedTransaction[] | undefined;
  transactionCount: number | undefined;
  blocksLoading: boolean;
  transactionsLoading: boolean;
  blocksUnavailable: boolean;
  transactionsUnavailable: boolean;
};

export const useHomeFeed = (provider: JsonRpcApiProvider): HomeFeed => {
  const latestBlockNumber = useLatestBlockNumber(provider);
  const [blocks, setBlocks] = useState<HomeBlockSummary[]>();
  const [transactionData, setTransactionData] =
    useState<BlockTransactionsPage>();
  const [blocksLoading, setBlocksLoading] = useState(true);
  const [transactionsLoading, setTransactionsLoading] = useState(true);
  const [blocksUnavailable, setBlocksUnavailable] = useState(false);
  const [transactionsUnavailable, setTransactionsUnavailable] = useState(false);

  const blocksRef = useRef<HomeBlockSummary[]>([]);
  const transactionDataRef = useRef<BlockTransactionsPage | undefined>(
    undefined,
  );

  useEffect(() => {
    if (latestBlockNumber === undefined) {
      return;
    }

    let disposed = false;
    const currentBlocks = blocksRef.current;
    const canPrependLatest =
      currentBlocks.length > 0 &&
      currentBlocks[0].number + 1 === latestBlockNumber;
    const blockNumbers = canPrependLatest
      ? [latestBlockNumber]
      : recentBlockNumbers(latestBlockNumber, HOME_BLOCK_COUNT);

    setBlocksLoading(currentBlocks.length === 0);
    setTransactionsLoading(transactionDataRef.current === undefined);

    const loadBlocks = Promise.all(
      blockNumbers.map((blockNumber) => provider.getBlock(blockNumber)),
    )
      .then((loadedBlocks) =>
        loadedBlocks.filter((block): block is Block => block !== null),
      )
      .then((loadedBlocks) => {
        if (disposed) {
          return;
        }

        const summaries = loadedBlocks.map(summarizeBlock);
        const nextBlocks = canPrependLatest
          ? [...summaries, ...currentBlocks].slice(0, HOME_BLOCK_COUNT)
          : summaries;
        blocksRef.current = nextBlocks;
        setBlocks(nextBlocks);
        setBlocksUnavailable(false);
      })
      .catch(() => {
        if (!disposed) {
          setBlocksUnavailable(true);
        }
      })
      .finally(() => {
        if (!disposed) {
          setBlocksLoading(false);
        }
      });

    const loadTransactions = readBlockTransactions(
      provider,
      latestBlockNumber,
      0,
      HOME_TRANSACTION_COUNT,
    )
      .then((nextTransactionData) => {
        if (disposed) {
          return;
        }
        transactionDataRef.current = nextTransactionData;
        setTransactionData(nextTransactionData);
        setTransactionsUnavailable(false);
      })
      .catch(() => {
        if (!disposed) {
          setTransactionsUnavailable(true);
        }
      })
      .finally(() => {
        if (!disposed) {
          setTransactionsLoading(false);
        }
      });

    void Promise.allSettled([loadBlocks, loadTransactions]);

    return () => {
      disposed = true;
    };
  }, [provider, latestBlockNumber]);

  return {
    latestBlockNumber,
    blocks,
    transactions: transactionData?.txs,
    transactionCount: transactionData?.total,
    blocksLoading,
    transactionsLoading,
    blocksUnavailable,
    transactionsUnavailable,
  };
};
