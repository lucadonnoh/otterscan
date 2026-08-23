import {
  faMagnifyingGlass,
  faQrcode,
  faServer,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FC, lazy, memo, useContext, useState } from "react";
import { NavLink } from "react-router";
import PriceBox from "./PriceBox";
import SourcifyMenu from "./SourcifyMenu";
import { supportsGNS } from "./api/name-resolver/GNSNameResolver";
import HomeFeed from "./home/HomeFeed";
import { useHomeFeed } from "./home/useHomeFeed";
import { useGenericSearch } from "./search/search";
import { useChainInfo } from "./useChainInfo";
import { useFinalizedSlotNumber, useSlotTimestamp } from "./useConsensus";
import { RuntimeContext } from "./useRuntime";
import { usePageTitle } from "./useTitle";
// @ts-expect-error
import Otter from "./otter.png?w=128&h=128&webp";

const CameraScanner = lazy(() => import("./search/CameraScanner"));

const Home: FC = () => {
  const { provider, config } = useContext(RuntimeContext);
  const { name: configuredNetworkName, nativeCurrency } = useChainInfo();
  const [searchRef, handleChange, handleSubmit] = useGenericSearch();
  const [isScanning, setScanning] = useState<boolean>(false);

  const chainId = provider._network.chainId;
  const networkName =
    configuredNetworkName.trim() ||
    (chainId === 1n
      ? "Ethereum Mainnet"
      : provider._network.name !== "unknown"
        ? provider._network.name
        : `Chain ${chainId.toString()}`);
  const hasENS =
    provider._network.getPlugin("org.ethers.plugins.network.Ens") !== null;
  const hasGNS = supportsGNS(chainId);
  const feed = useHomeFeed(provider);
  const finalizedSlotNumber = useFinalizedSlotNumber();
  const finalizedSlotTimestamp = useSlotTimestamp(finalizedSlotNumber);
  const showPrice =
    chainId === 1n ||
    config.priceOracleInfo?.nativeTokenPrice?.ethUSDOracleAddress !== undefined;

  usePageTitle("Home");

  const searchTypes = [
    "address",
    "transaction hash",
    "block",
    ...(hasENS ? ["ENS name"] : []),
    ...(hasGNS ? [".gwei name"] : []),
  ];

  return (
    <>
      {isScanning && <CameraScanner turnOffScan={() => setScanning(false)} />}
      <main className="min-h-0 grow overflow-y-auto bg-slate-50">
        <header className="relative z-20 border-b border-slate-200 bg-white">
          <div className="border-b border-slate-100">
            <div className="mx-auto flex min-h-10 max-w-[100rem] items-center justify-between px-3 sm:px-5 lg:px-8">
              <div className="hidden sm:block">
                {showPrice ? (
                  <PriceBox />
                ) : (
                  <span className="text-xs text-slate-500">{networkName}</span>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-40" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                <FontAwesomeIcon icon={faServer} />
                Direct node data
              </div>
            </div>
          </div>

          <nav className="mx-auto flex h-[4.5rem] max-w-[100rem] items-center justify-between px-3 sm:px-5 lg:px-8">
            <NavLink className="flex min-w-0 items-center gap-3" to="/">
              <img
                alt="An otter scanning"
                className="h-11 w-11 rounded-full"
                height={44}
                src={Otter}
                title="An otter scanning"
                width={44}
              />
              <span
                className="truncate font-title text-2xl font-bold text-slate-800"
                data-test="logotext"
              >
                {config.branding?.siteName || "Otterscan"}
                {config.experimental && <span className="text-red-400">2</span>}
              </span>
            </NavLink>

            <div className="flex h-full items-center gap-1 sm:gap-2">
              <div className="hidden h-full items-center gap-1 md:flex">
                <NavLink
                  className="flex h-full items-center border-b-2 border-link-blue px-3 text-sm font-medium text-link-blue"
                  to="/"
                >
                  Home
                </NavLink>
                <NavLink
                  className="flex h-full items-center border-b-2 border-transparent px-3 text-sm font-medium text-slate-600 hover:text-link-blue"
                  to="/special/liveBlocks"
                >
                  Latest blocks
                </NavLink>
                {finalizedSlotNumber !== undefined && (
                  <NavLink
                    className="flex h-full items-center border-b-2 border-transparent px-3 text-sm font-medium text-slate-600 hover:text-link-blue"
                    to={`/slot/${finalizedSlotNumber}`}
                  >
                    Consensus
                  </NavLink>
                )}
                {config.experimental && (
                  <NavLink
                    className="flex h-full items-center border-b-2 border-transparent px-3 text-sm font-medium text-slate-600 hover:text-link-blue"
                    to="/contracts/all"
                  >
                    Contracts
                  </NavLink>
                )}
              </div>
              <div className="h-10">
                <SourcifyMenu />
              </div>
            </div>
          </nav>
        </header>

        <section className="home-hero-pattern dark-no-invert relative overflow-hidden text-white">
          <div className="relative mx-auto max-w-[100rem] px-3 pt-11 pb-28 sm:px-5 sm:pt-14 lg:px-8">
            <div className="max-w-5xl">
              <div className="mb-3 text-xs font-bold tracking-[0.16em] text-sky-300 uppercase">
                {networkName} explorer
              </div>
              <h1 className="font-title text-3xl font-bold tracking-tight sm:text-4xl">
                Search the Ethereum blockchain
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
                Blocks, transactions, contracts, and names—read directly from
                your node with no explorer indexer.
              </p>

              <form
                autoComplete="off"
                className="mt-7 flex max-w-5xl rounded-xl bg-white p-1.5 shadow-2xl shadow-black/25"
                onSubmit={handleSubmit}
                spellCheck={false}
              >
                <div className="flex w-full min-w-0 items-center">
                  <FontAwesomeIcon
                    className="ml-3 text-slate-400"
                    icon={faMagnifyingGlass}
                  />
                  <input
                    autoFocus
                    className="min-w-0 grow bg-transparent px-3 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden sm:text-base"
                    data-test="home-search-input"
                    onChange={handleChange}
                    placeholder={`Search by ${searchTypes.join(" / ")}`}
                    ref={searchRef}
                    type="text"
                  />
                </div>
                <button
                  aria-label="Scan an Ethereum address using your camera"
                  className="flex w-11 shrink-0 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-link-blue focus:outline-hidden"
                  onClick={() => setScanning(true)}
                  title="Scan an Ethereum address using your camera"
                  type="button"
                >
                  <FontAwesomeIcon icon={faQrcode} />
                </button>
                <button
                  aria-label="Search"
                  className="ml-1 flex shrink-0 items-center justify-center gap-2 rounded-lg bg-link-blue px-4 py-3 text-sm font-bold text-white hover:bg-link-blue-hover focus:outline-hidden sm:px-5"
                  type="submit"
                >
                  <FontAwesomeIcon icon={faMagnifyingGlass} />
                  <span className="hidden sm:inline">Search</span>
                </button>
              </form>
              <div className="mt-3 text-xs text-slate-400">
                Search addresses · transaction hashes · blocks
                {hasENS && " · ENS"}
                {hasGNS && " · .gwei"}
              </div>
            </div>
          </div>
        </section>

        <div className="relative z-10 mx-auto -mt-14 max-w-[100rem] px-3 pb-10 sm:px-5 lg:px-8">
          <HomeFeed
            chainId={chainId}
            feed={feed}
            finalizedSlotNumber={finalizedSlotNumber}
            finalizedSlotTimestamp={finalizedSlotTimestamp}
            nativeDecimals={nativeCurrency.decimals}
            nativeSymbol={nativeCurrency.symbol}
            networkName={networkName}
          />
          {!(config.branding?.hideAnnouncements ?? false) &&
            config.experimental && (
              <div className="pt-6 text-center">
                <NavLink
                  className="text-sm font-bold text-emerald-600 hover:text-emerald-800"
                  to="/contracts/all"
                >
                  Explore the experimental contract browser
                </NavLink>
              </div>
            )}
        </div>
      </main>
    </>
  );
};

export default memo(Home);
