import {
  faArrowRight,
  faCheckDouble,
  faCube,
  faFileLines,
  faGasPump,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FC, memo, PropsWithChildren, ReactNode } from "react";
import { NavLink } from "react-router";
import { TickerContextProvider } from "../components/AutoRefreshAge";
import TimestampAge from "../components/TimestampAge";
import { ProcessedTransaction } from "../types";
import { blockTxsURL, blockURL, slotURL, transactionURL } from "../url";
import { commify } from "../utils/utils";
import {
  formatGwei,
  formatNativeValue,
  gasUsedPercentage,
  shortenHex,
} from "./homeFormatters";
import { HomeBlockSummary, HomeFeed as HomeFeedData } from "./useHomeFeed";

type HomeFeedProps = {
  networkName: string;
  chainId: bigint;
  nativeSymbol: string;
  nativeDecimals: number;
  finalizedSlotNumber: number | undefined;
  finalizedSlotTimestamp: number | undefined;
  feed: HomeFeedData;
};

type MetricProps = {
  icon: typeof faCube;
  label: string;
  value: ReactNode;
  detail: ReactNode;
};

const Metric: FC<MetricProps> = ({ icon, label, value, detail }) => (
  <div className="flex min-h-32 items-center gap-4 bg-white px-5 py-5 dark:bg-slate-900">
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-link-blue dark:bg-sky-950/60 dark:text-link-blue-light">
      <FontAwesomeIcon icon={icon} />
    </div>
    <div className="min-w-0">
      <div className="text-[0.68rem] font-bold tracking-[0.12em] text-slate-500 uppercase dark:text-slate-400">
        {label}
      </div>
      <div className="mt-1 truncate text-xl font-semibold text-slate-900 dark:text-slate-100">
        {value}
      </div>
      <div className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">
        {detail}
      </div>
    </div>
  </div>
);

type PanelProps = PropsWithChildren<{
  title: string;
  footer: ReactNode;
}>;

const Panel: FC<PanelProps> = ({ title, footer, children }) => (
  <section className="flex min-h-[31rem] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
    <header className="border-b border-slate-200 px-5 py-4 dark:border-slate-800">
      <h2 className="font-title text-base font-bold text-slate-900 dark:text-slate-100">
        {title}
      </h2>
    </header>
    <div className="grow divide-y divide-slate-100 dark:divide-slate-800">
      {children}
    </div>
    <footer className="border-t border-slate-200 bg-slate-50 px-5 py-3 text-center text-xs font-bold tracking-wide uppercase dark:border-slate-800 dark:bg-slate-950/40">
      {footer}
    </footer>
  </section>
);

const PanelSkeleton: FC = () => (
  <>
    {Array.from({ length: 6 }, (_, index) => (
      <div
        className="grid animate-pulse grid-cols-[2.75rem_minmax(0,1fr)_auto] gap-3 px-5 py-4"
        key={index}
      >
        <div className="h-11 w-11 rounded-xl bg-slate-100 dark:bg-slate-800" />
        <div className="space-y-2 py-1">
          <div className="h-3 w-28 rounded bg-slate-100 dark:bg-slate-800" />
          <div className="h-3 w-44 max-w-full rounded bg-slate-100 dark:bg-slate-800" />
        </div>
        <div className="h-6 w-16 rounded-lg bg-slate-100 dark:bg-slate-800" />
      </div>
    ))}
  </>
);

const Unavailable: FC = () => (
  <div className="flex min-h-80 items-center justify-center px-5 text-center text-sm text-slate-500 dark:text-slate-400">
    Live data is temporarily unavailable. The explorer will retry on the next
    block.
  </div>
);

const AddressLink: FC<{ address: string | undefined }> = ({ address }) => {
  if (address === undefined) {
    return <span className="text-slate-400">Unknown</span>;
  }
  return (
    <NavLink
      className="font-address text-link-blue hover:text-link-blue-hover"
      title={address}
      to={`/address/${address}`}
    >
      {shortenHex(address, 8, 5)}
    </NavLink>
  );
};

const BlockRow: FC<{ block: HomeBlockSummary }> = ({ block }) => {
  const gasPercentage = gasUsedPercentage(block.gasUsed, block.gasLimit);

  return (
    <div className="grid grid-cols-[2.75rem_minmax(0,1fr)_auto] items-center gap-3 px-5 py-3.5">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-50 text-slate-500 dark:bg-slate-800 dark:text-slate-300">
        <FontAwesomeIcon icon={faCube} />
      </div>
      <div className="min-w-0">
        <div className="flex min-w-0 items-baseline gap-2">
          <NavLink
            className="truncate font-blocknum font-semibold text-link-blue hover:text-link-blue-hover"
            to={blockURL(block.number)}
          >
            {commify(block.number)}
          </NavLink>
          <span className="shrink-0 text-xs text-slate-500 dark:text-slate-400">
            <TimestampAge timestamp={block.timestamp} />
          </span>
        </div>
        <div className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">
          Fee recipient <AddressLink address={block.feeRecipient} />
          <span className="px-1.5 text-slate-300 dark:text-slate-700">·</span>
          <NavLink
            className="text-link-blue hover:text-link-blue-hover"
            to={blockTxsURL(block.number)}
          >
            {commify(block.transactionCount)} txns
          </NavLink>
        </div>
      </div>
      <div className="text-right">
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 font-balance text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
          {gasPercentage.toFixed(1)}%
        </div>
        <div className="mt-1 hidden text-[0.65rem] text-slate-400 sm:block">
          gas used
        </div>
      </div>
    </div>
  );
};

const TransactionRow: FC<{
  transaction: ProcessedTransaction;
  nativeSymbol: string;
  nativeDecimals: number;
}> = ({ transaction, nativeSymbol, nativeDecimals }) => {
  const recipient = transaction.to ?? transaction.createdContractAddress;

  return (
    <div className="grid grid-cols-[2.75rem_minmax(0,1fr)_auto] items-center gap-3 px-5 py-3.5">
      <div
        className={`flex h-11 w-11 items-center justify-center rounded-xl ${
          transaction.status === 0
            ? "bg-red-50 text-red-500 dark:bg-red-950/50"
            : "bg-slate-50 text-slate-500 dark:bg-slate-800 dark:text-slate-300"
        }`}
      >
        <FontAwesomeIcon icon={faFileLines} />
      </div>
      <div className="min-w-0">
        <div className="flex min-w-0 items-baseline gap-2">
          <NavLink
            className="truncate font-hash font-semibold text-link-blue hover:text-link-blue-hover"
            title={transaction.hash}
            to={transactionURL(transaction.hash)}
          >
            {shortenHex(transaction.hash)}
          </NavLink>
          <span className="shrink-0 text-xs text-slate-500 dark:text-slate-400">
            <TimestampAge timestamp={transaction.timestamp} />
          </span>
        </div>
        <div className="mt-1 flex min-w-0 gap-1.5 truncate text-xs text-slate-500 dark:text-slate-400">
          <span>From</span>
          <AddressLink address={transaction.from} />
          <span className="text-slate-300 dark:text-slate-700">→</span>
          {recipient ? (
            <AddressLink address={recipient} />
          ) : (
            <span>Contract creation</span>
          )}
        </div>
        <div className="mt-1 text-xs text-slate-500 sm:hidden dark:text-slate-400">
          {formatNativeValue(transaction.value, nativeSymbol, nativeDecimals)}
        </div>
      </div>
      <div className="hidden max-w-28 truncate rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 font-balance text-xs text-slate-700 sm:block dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
        {formatNativeValue(transaction.value, nativeSymbol, nativeDecimals)}
      </div>
    </div>
  );
};

const FooterLink: FC<{ to: string; children: ReactNode }> = ({
  to,
  children,
}) => (
  <NavLink
    className="text-slate-600 hover:text-link-blue dark:text-slate-300 dark:hover:text-link-blue-light"
    to={to}
  >
    {children} <FontAwesomeIcon className="ml-1" icon={faArrowRight} />
  </NavLink>
);

const HomeFeed: FC<HomeFeedProps> = ({
  networkName,
  chainId,
  nativeSymbol,
  nativeDecimals,
  finalizedSlotNumber,
  finalizedSlotTimestamp,
  feed,
}) => {
  const latestBlock = feed.blocks?.[0];
  const latestTransactionCount =
    feed.transactionCount ?? latestBlock?.transactionCount;

  return (
    <TickerContextProvider>
      <div className="space-y-5">
        <section className="grid gap-px overflow-hidden rounded-2xl bg-slate-200 shadow-lg shadow-slate-900/5 sm:grid-cols-2 xl:grid-cols-4 dark:bg-slate-700 dark:shadow-black/20">
          <Metric
            icon={faCube}
            label="Latest block"
            value={
              latestBlock ? (
                <NavLink
                  className="text-link-blue hover:text-link-blue-hover"
                  data-test="home-latest-block-header"
                  to={blockURL(latestBlock.number)}
                >
                  {commify(latestBlock.number)}
                </NavLink>
              ) : (
                "—"
              )
            }
            detail={`${networkName} · Chain ${chainId.toString()}`}
          />
          <Metric
            icon={faFileLines}
            label="Transactions"
            value={
              latestTransactionCount === undefined
                ? "—"
                : commify(latestTransactionCount)
            }
            detail="Included in the latest block"
          />
          <Metric
            icon={faGasPump}
            label="Base fee"
            value={`${formatGwei(latestBlock?.baseFeePerGas)} Gwei`}
            detail={
              latestBlock
                ? `${gasUsedPercentage(
                    latestBlock.gasUsed,
                    latestBlock.gasLimit,
                  ).toFixed(1)}% block gas used`
                : "Waiting for the execution head"
            }
          />
          <Metric
            icon={faCheckDouble}
            label="Finalized slot"
            value={
              finalizedSlotNumber === undefined ? (
                "—"
              ) : (
                <NavLink
                  className="text-link-blue hover:text-link-blue-hover"
                  to={slotURL(finalizedSlotNumber)}
                >
                  {commify(finalizedSlotNumber)}
                </NavLink>
              )
            }
            detail={
              finalizedSlotTimestamp === undefined ? (
                "Consensus finality"
              ) : (
                <TimestampAge timestamp={finalizedSlotTimestamp} />
              )
            }
          />
        </section>

        <div className="grid gap-5 lg:grid-cols-2">
          <Panel
            title="Latest blocks"
            footer={
              <FooterLink to="/special/liveBlocks">View live blocks</FooterLink>
            }
          >
            {feed.blocksLoading && feed.blocks === undefined ? (
              <PanelSkeleton />
            ) : feed.blocks && feed.blocks.length > 0 ? (
              feed.blocks.map((block) => (
                <BlockRow block={block} key={block.number} />
              ))
            ) : (
              <Unavailable />
            )}
          </Panel>

          <Panel
            title="Latest transactions"
            footer={
              feed.latestBlockNumber === undefined ? (
                <span className="text-slate-400">Waiting for head</span>
              ) : (
                <FooterLink to={blockTxsURL(feed.latestBlockNumber)}>
                  View block transactions
                </FooterLink>
              )
            }
          >
            {feed.transactionsLoading && feed.transactions === undefined ? (
              <PanelSkeleton />
            ) : feed.transactions && feed.transactions.length > 0 ? (
              feed.transactions.map((transaction) => (
                <TransactionRow
                  key={transaction.hash}
                  nativeDecimals={nativeDecimals}
                  nativeSymbol={nativeSymbol}
                  transaction={transaction}
                />
              ))
            ) : feed.transactionsUnavailable ? (
              <Unavailable />
            ) : (
              <div className="flex min-h-80 items-center justify-center px-5 text-sm text-slate-500 dark:text-slate-400">
                The latest block contains no transactions.
              </div>
            )}
          </Panel>
        </div>
      </div>
    </TickerContextProvider>
  );
};

export default memo(HomeFeed);
