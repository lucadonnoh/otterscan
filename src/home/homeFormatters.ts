import { formatUnits } from "ethers";

const trimTrailingZeroes = (value: string): string =>
  value.includes(".") ? value.replace(/0+$/, "").replace(/\.$/, "") : value;

export const shortenHex = (
  value: string,
  startLength = 10,
  endLength = 6,
): string => {
  if (value.length <= startLength + endLength + 1) {
    return value;
  }
  return `${value.slice(0, startLength)}…${value.slice(-endLength)}`;
};

export const recentBlockNumbers = (
  latestBlockNumber: number,
  count: number,
): number[] => {
  if (latestBlockNumber < 0 || count <= 0) {
    return [];
  }

  return Array.from(
    { length: Math.min(count, latestBlockNumber + 1) },
    (_, index) => latestBlockNumber - index,
  );
};

export const formatGwei = (value: bigint | null | undefined): string => {
  if (value === undefined || value === null) {
    return "—";
  }
  if (value === 0n) {
    return "0";
  }

  const amount = Number(formatUnits(value, 9));
  if (amount < 0.001) {
    return "<0.001";
  }

  const precision = amount >= 100 ? 0 : amount >= 1 ? 2 : 3;
  return trimTrailingZeroes(amount.toFixed(precision));
};

export const formatNativeValue = (
  value: bigint,
  symbol: string,
  decimals = 18,
): string => {
  if (value === 0n) {
    return `0 ${symbol}`;
  }

  const amount = Number(formatUnits(value, decimals));
  if (amount < 0.00001) {
    return `<0.00001 ${symbol}`;
  }

  const precision = amount >= 1_000 ? 2 : amount >= 1 ? 4 : 5;
  return `${trimTrailingZeroes(amount.toFixed(precision))} ${symbol}`;
};

export const gasUsedPercentage = (
  gasUsed: bigint,
  gasLimit: bigint,
): number => {
  if (gasLimit <= 0n) {
    return 0;
  }
  return Number((gasUsed * 1_000n) / gasLimit) / 10;
};
