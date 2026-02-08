import { JsonRpcApiProvider } from "ethers";
import { useEffect, useState } from "react";
import { ExtendedBlock, readBlock } from "../useErigonHooks";

const BLOCK_COUNT = 6;

export const useRecentBlocks = (
  provider: JsonRpcApiProvider,
  latestBlockNumber: number | undefined,
): ExtendedBlock[] => {
  const [blocks, setBlocks] = useState<ExtendedBlock[]>([]);

  useEffect(() => {
    if (latestBlockNumber === undefined) {
      return;
    }

    const fetchBlocks = async () => {
      const blockNumbers = Array.from(
        { length: BLOCK_COUNT },
        (_, i) => latestBlockNumber - i,
      ).filter((n) => n >= 0);

      const results = await Promise.all(
        blockNumbers.map((n) => readBlock(provider, n.toString())),
      );
      setBlocks(results.filter((b): b is ExtendedBlock => b !== null));
    };

    fetchBlocks();
  }, [provider, latestBlockNumber]);

  return blocks;
};
