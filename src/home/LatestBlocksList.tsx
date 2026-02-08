import { faCube } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FC, memo } from "react";
import { NavLink } from "react-router";
import NativeTokenAmount from "../components/NativeTokenAmount";
import TimestampAge from "../components/TimestampAge";
import { ExtendedBlock } from "../useErigonHooks";
import { blockURL, blockTxsURL } from "../url";
import { commify } from "../utils/utils";

type LatestBlocksListProps = {
  blocks: ExtendedBlock[];
};

const calcBlockReward = (block: ExtendedBlock): bigint => {
  const totalFees = block.feeReward ?? 0n;
  const gasUsedWithoutDepositTx =
    block.gasUsed - (block.gasUsedDepositTx ?? 0n);
  const burntFees =
    (block.baseFeePerGas && block.baseFeePerGas * gasUsedWithoutDepositTx) ??
    0n;
  const netFeeReward = totalFees - burntFees;
  return block.blockReward + netFeeReward;
};

const truncateAddress = (addr: string): string =>
  `${addr.slice(0, 8)}...${addr.slice(-6)}`;

const LatestBlocksList: FC<LatestBlocksListProps> = ({ blocks }) => {
  const latestBlockNumber = blocks.length > 0 ? blocks[0].number : undefined;

  return (
  <div className="rounded-lg border bg-white shadow-sm">
    <div className="border-b px-4 py-3">
      <h2 className="text-sm font-semibold">Latest Blocks</h2>
    </div>
    <div className="divide-y">
      {blocks.map((block) => (
        <div
          key={block.number}
          className="flex items-center gap-4 px-4 py-3 text-sm"
        >
          {/* Block icon + number */}
          <div className="flex min-w-[100px] items-center space-x-2">
            <span className="text-gray-400">
              <FontAwesomeIcon icon={faCube} />
            </span>
            <div>
              <NavLink
                className="font-blocknum text-link-blue hover:text-link-blue-hover"
                to={blockURL(block.number)}
              >
                {commify(block.number)}
              </NavLink>
              <div className="text-xs text-gray-400">
                <TimestampAge timestamp={block.timestamp} />
              </div>
            </div>
          </div>

          {/* Miner + tx count */}
          <div className="min-w-0 flex-1">
            {block.miner && (
              <div className="truncate text-xs">
                Fee Recipient{" "}
                <NavLink
                  className="font-address text-link-blue hover:text-link-blue-hover"
                  to={`/address/${block.miner}`}
                  title={block.miner}
                >
                  {truncateAddress(block.miner)}
                </NavLink>
              </div>
            )}
            <div className="text-xs text-gray-500">
              <NavLink
                className="text-link-blue hover:text-link-blue-hover"
                to={blockTxsURL(block.number)}
              >
                {block.transactionCount} txn{block.transactionCount !== 1 && "s"}
              </NavLink>
            </div>
          </div>

          {/* Reward */}
          <div className="text-right text-xs">
            <NativeTokenAmount value={calcBlockReward(block)} />
          </div>
        </div>
      ))}
      {blocks.length === 0 && (
        <div className="px-4 py-8 text-center text-sm text-gray-400">
          Loading blocks...
        </div>
      )}
    </div>
    <div className="border-t px-4 py-3 text-center">
      {latestBlockNumber !== undefined ? (
        <NavLink
          className="text-sm uppercase text-link-blue hover:text-link-blue-hover"
          to={blockURL(latestBlockNumber)}
        >
          View Latest Block &rarr;
        </NavLink>
      ) : (
        <span className="text-sm uppercase text-gray-400">
          View Latest Block &rarr;
        </span>
      )}
    </div>
  </div>
  );
};

export default memo(LatestBlocksList);
