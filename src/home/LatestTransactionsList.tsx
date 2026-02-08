import { faExchangeAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { formatEther } from "ethers";
import { FC, memo } from "react";
import { NavLink } from "react-router";
import TimestampAge from "../components/TimestampAge";
import DecoratedAddressLink from "../execution/components/DecoratedAddressLink";
import { ProcessedTransaction } from "../types";
import { useChainInfo } from "../useChainInfo";
import { blockTxsURL, transactionURL } from "../url";

type LatestTransactionsListProps = {
  txs: ProcessedTransaction[];
};

const truncateHash = (hash: string): string =>
  `${hash.slice(0, 10)}...${hash.slice(-8)}`;

const LatestTransactionsList: FC<LatestTransactionsListProps> = ({ txs }) => {
  const {
    nativeCurrency: { symbol },
  } = useChainInfo();

  const latestBlockNumber = txs.length > 0 ? txs[0].blockNumber : undefined;

  return (
    <div className="rounded-lg border bg-white shadow-sm">
      <div className="border-b px-4 py-3">
        <h2 className="text-sm font-semibold">Latest Transactions</h2>
      </div>
      <div className="divide-y">
        {txs.map((tx) => (
          <div
            key={tx.hash}
            className="flex items-center gap-4 px-4 py-3 text-sm"
          >
            {/* Tx icon + hash */}
            <div className="flex min-w-[130px] items-center space-x-2">
              <span className="text-gray-400">
                <FontAwesomeIcon icon={faExchangeAlt} />
              </span>
              <div>
                <NavLink
                  className="font-hash text-link-blue hover:text-link-blue-hover"
                  to={transactionURL(tx.hash)}
                  title={tx.hash}
                >
                  {truncateHash(tx.hash)}
                </NavLink>
                <div className="text-xs text-gray-400">
                  <TimestampAge timestamp={tx.timestamp} />
                </div>
              </div>
            </div>

            {/* From -> To */}
            <div className="min-w-0 flex-1 text-xs">
              {tx.from && (
                <div className="flex items-baseline gap-1">
                  <span className="shrink-0 text-gray-500">From</span>
                  <span className="min-w-0 truncate">
                    <DecoratedAddressLink address={tx.from} txFrom />
                  </span>
                </div>
              )}
              {tx.to && (
                <div className="flex items-baseline gap-1">
                  <span className="shrink-0 text-gray-500">To</span>
                  <span className="min-w-0 truncate">
                    <DecoratedAddressLink address={tx.to} txTo />
                  </span>
                </div>
              )}
            </div>

            {/* Value */}
            <div className="whitespace-nowrap text-right text-xs">
              {parseFloat(formatEther(tx.value)).toFixed(4)} {symbol}
            </div>
          </div>
        ))}
        {txs.length === 0 && (
          <div className="px-4 py-8 text-center text-sm text-gray-400">
            Loading transactions...
          </div>
        )}
      </div>
      <div className="border-t px-4 py-3 text-center">
        {latestBlockNumber !== undefined ? (
          <NavLink
            className="text-sm uppercase text-link-blue hover:text-link-blue-hover"
            to={blockTxsURL(latestBlockNumber)}
          >
            View Latest Block Txns &rarr;
          </NavLink>
        ) : (
          <span className="text-sm uppercase text-gray-400">
            View Latest Block Txns &rarr;
          </span>
        )}
      </div>
    </div>
  );
};

export default memo(LatestTransactionsList);
