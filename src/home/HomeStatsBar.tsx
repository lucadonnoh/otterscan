import { faBolt, faCube, faDollarSign, faGasPump } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Block } from "ethers";
import { FC, memo } from "react";
import { NavLink } from "react-router";
import TimestampAge from "../components/TimestampAge";
import { useChainInfo } from "../useChainInfo";
import { formatFiatValue, useFiatValue } from "../usePriceOracle";
import { blockURL } from "../url";
import { commify } from "../utils/utils";

type TpsData = {
  value: number;
  totalTxs: number;
  timeSpan: number;
};

type HomeStatsBarProps = {
  latestBlock: Block | undefined;
  gasPrice: bigint | undefined;
  tps: TpsData | undefined;
};

const HomeStatsBar: FC<HomeStatsBarProps> = ({
  latestBlock,
  gasPrice,
  tps,
}) => {
  const {
    nativeCurrency: { symbol, decimals },
  } = useChainInfo();

  const nativeTokenPrice = useFiatValue(10n ** BigInt(decimals), "latest");
  const formattedPrice = formatFiatValue(nativeTokenPrice);

  const gasPriceGwei =
    gasPrice !== undefined
      ? (Number(gasPrice) / 1e9).toFixed(2)
      : undefined;

  return (
    <div className="mx-auto -mt-10 max-w-5xl px-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* ETH Price */}
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
              <FontAwesomeIcon icon={faDollarSign} />
            </div>
            <div>
              <div className="text-xs uppercase text-gray-500">
                {symbol} Price
              </div>
              <div className="text-sm font-semibold">
                {formattedPrice ? `$${formattedPrice}` : "N/A"}
              </div>
            </div>
          </div>
        </div>

        {/* Gas Price */}
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 text-purple-600">
              <FontAwesomeIcon icon={faGasPump} />
            </div>
            <div>
              <div className="text-xs uppercase text-gray-500">Gas Price</div>
              <div className="text-sm font-semibold">
                {gasPriceGwei !== undefined ? `${gasPriceGwei} Gwei` : "N/A"}
              </div>
            </div>
          </div>
        </div>

        {/* TPS */}
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-100 text-cyan-600">
              <FontAwesomeIcon icon={faBolt} />
            </div>
            <div>
              <div className="text-xs uppercase text-gray-500">TPS</div>
              <div className="text-sm font-semibold">
                {tps !== undefined ? tps.value.toFixed(2) : "N/A"}
              </div>
              {tps !== undefined && (
                <div className="text-xs text-gray-400">
                  {tps.totalTxs} txns / {tps.timeSpan}s
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Latest Block */}
        {latestBlock && (
          <NavLink
            to={blockURL(latestBlock.number)}
            className="rounded-lg border bg-white p-4 shadow-sm transition-colors hover:bg-gray-50"
          >
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                <FontAwesomeIcon icon={faCube} />
              </div>
              <div>
                <div className="text-xs uppercase text-gray-500">
                  Latest Block
                </div>
                <div className="text-sm font-semibold">
                  {commify(latestBlock.number)}
                </div>
                <div className="text-xs text-gray-400">
                  <TimestampAge timestamp={latestBlock.timestamp} />
                </div>
              </div>
            </div>
          </NavLink>
        )}
      </div>
    </div>
  );
};

export default memo(HomeStatsBar);
