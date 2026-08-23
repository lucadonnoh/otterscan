import { FixedNumber, formatEther } from "ethers";
import React from "react";
import BlockLink from "../../components/BlockLink";
import TimestampAge from "../../components/TimestampAge";
import { useChainInfo } from "../../useChainInfo";
import { ExtendedBlock } from "../../useErigonHooks";
import { commify } from "../../utils/utils";
import Blip from "./Blip";
import { BlockSupply } from "./issuance";

const ELASTICITY_MULTIPLIER = 2n;

type BlockRowProps = {
  block: ExtendedBlock;
  baseFeeDelta: number;
  supply?: BlockSupply;
};

const BlockRow: React.FC<BlockRowProps> = ({ block, baseFeeDelta, supply }) => {
  const {
    nativeCurrency: { symbol },
  } = useChainInfo();
  const gasTarget = block.gasLimit / ELASTICITY_MULTIPLIER;
  const burntFees = block.baseFeePerGas! * block.gasUsed;

  return (
    <div className="grid grid-cols-9 gap-x-2 px-3 py-2 hover:bg-skin-table-hover">
      <div>
        <BlockLink blockTag={block.number} />
      </div>
      <div
        className={`col-span-2 text-right ${
          block.gasUsed > gasTarget
            ? "text-emerald-500"
            : block.gasUsed < gasTarget
              ? "text-red-500"
              : ""
        }`}
      >
        {commify(block.gasUsed.toString())} (
        {block.gasUsed > gasTarget ? "+" : ""}
        {FixedNumber.fromValue(block.gasUsed)
          .subUnsafe(FixedNumber.fromValue(gasTarget))
          .mulUnsafe(FixedNumber.fromValue(100))
          .divUnsafe(FixedNumber.fromValue(gasTarget))
          .round(2)
          .toUnsafeFloat()}
        %)
      </div>
      <div className="text-right">
        <div className="relative">
          <div>
            {FixedNumber.fromValue(block.baseFeePerGas ?? 0n)
              .divUnsafe(FixedNumber.fromValue(1_000_000_000n))
              .toUnsafeFloat()
              .toFixed(2)}{" "}
            Gwei
          </div>
          {supply !== undefined && (
            <div
              className={`text-xs ${
                supply.deflationary ? "text-emerald-500" : "text-gray-400"
              }`}
              title="Base fee where execution-layer burn equals consensus issuance"
            >
              defl. above {supply.breakEvenBaseFeeGwei.toFixed(2)} Gwei
            </div>
          )}
          <Blip value={baseFeeDelta} />
        </div>
      </div>
      <div
        className="col-span-2 text-right text-violet-500"
        title={
          supply === undefined
            ? undefined
            : `Consensus issuance only: participation-adjusted attestation rewards plus proposer and sync committee rewards across ${supply.slotsElapsed} slot${
                supply.slotsElapsed === 1 ? "" : "s"
              }; priority fees and MEV are excluded`
        }
      >
        {supply === undefined
          ? "—"
          : `~${commify(formatEther(supply.issuanceWei))} ${symbol}`}
      </div>
      <div
        className={`col-span-2 text-right ${
          supply?.deflationary ? "text-emerald-500" : "text-orange-500"
        }`}
      >
        <span className="line-through">
          {commify(formatEther(burntFees))} {symbol}
        </span>
        {supply !== undefined && (
          <span className="ml-2 text-xs">
            {supply.deflationary
              ? "deflationary"
              : supply.burntWei < supply.issuanceWei
                ? "inflationary"
                : "neutral"}
          </span>
        )}
      </div>
      <div className="text-right text-gray-400">
        <TimestampAge timestamp={block.timestamp} />
      </div>
    </div>
  );
};

export default React.memo(BlockRow);
