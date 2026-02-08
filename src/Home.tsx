import { FC, memo, useContext, useMemo } from "react";
import { TickerContextProvider } from "./components/AutoRefreshAge";
import HomeHeroSection from "./home/HomeHeroSection";
import HomeStatsBar from "./home/HomeStatsBar";
import LatestBlocksList from "./home/LatestBlocksList";
import LatestTransactionsList from "./home/LatestTransactionsList";
import { useGasPrice } from "./home/useGasPrice";
import { useLatestTransactions } from "./home/useLatestTransactions";
import { useRecentBlocks } from "./home/useRecentBlocks";
import { useLatestBlockHeader, useLatestBlockNumber } from "./useLatestBlock";
import { RuntimeContext } from "./useRuntime";
import { usePageTitle } from "./useTitle";

const Home: FC = () => {
  const { provider } = useContext(RuntimeContext);

  const latestBlock = useLatestBlockHeader(provider);
  const latestBlockNumber = useLatestBlockNumber(provider);
  const gasPrice = useGasPrice(provider);
  const recentBlocks = useRecentBlocks(provider, latestBlockNumber);
  const latestTxs = useLatestTransactions(provider, latestBlockNumber);

  const tps = useMemo(() => {
    if (recentBlocks.length < 2) return undefined;
    const newest = recentBlocks[0];
    const oldest = recentBlocks[recentBlocks.length - 1];
    const timeSpan = newest.timestamp - oldest.timestamp;
    if (timeSpan <= 0) return undefined;
    const totalTxs = recentBlocks.reduce(
      (sum, b) => sum + b.transactionCount,
      0,
    );
    return { value: totalTxs / timeSpan, totalTxs, timeSpan };
  }, [recentBlocks]);

  usePageTitle("Home");

  return (
    <TickerContextProvider>
      <div className="min-h-screen bg-gray-50">
        <HomeHeroSection />
        <HomeStatsBar
          latestBlock={latestBlock}
          gasPrice={gasPrice}
          tps={tps}
        />
        <div className="mx-auto mt-8 max-w-5xl px-4 pb-8">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <LatestBlocksList blocks={recentBlocks} />
            <LatestTransactionsList txs={latestTxs} />
          </div>
        </div>
      </div>
    </TickerContextProvider>
  );
};

export default memo(Home);
