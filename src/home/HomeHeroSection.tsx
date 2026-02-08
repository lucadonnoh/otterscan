import { faQrcode } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FC, lazy, memo, useContext, useState } from "react";
// @ts-expect-error
import Otter from "../otter.png?w=128&h=128&webp";
import SourcifyMenu from "../SourcifyMenu";
import { useGenericSearch } from "../search/search";
import { RuntimeContext } from "../useRuntime";

const CameraScanner = lazy(() => import("../search/CameraScanner"));

const HomeHeroSection: FC = () => {
  const { provider, config } = useContext(RuntimeContext);
  const [searchRef, handleChange, handleSubmit] = useGenericSearch();
  const [isScanning, setScanning] = useState(false);

  const siteName = config.branding?.siteName || "Otterscan";

  return (
    <div className="bg-gradient-to-r from-[#1a1a2e] to-[#16213e] px-4 pb-20 pt-10 text-white">
      {isScanning && <CameraScanner turnOffScan={() => setScanning(false)} />}
      <div className="flex justify-end">
        <SourcifyMenu />
      </div>
      <div className="mx-auto max-w-5xl">
        <div className="mb-2 flex items-center justify-center space-x-3">
          <img
            className="rounded-full"
            src={Otter}
            width={48}
            height={48}
            alt="An otter scanning"
          />
          <h1 className="text-3xl font-bold">{siteName}</h1>
        </div>
        <p className="mb-6 text-center text-sm text-gray-300">
          Custom Otterscan + Nethermind Ethereum explorer
        </p>
        <form
          className="mx-auto flex max-w-2xl"
          onSubmit={handleSubmit}
          autoComplete="off"
          spellCheck={false}
        >
          <input
            className="w-full rounded-l-lg border-0 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none"
            type="text"
            size={50}
            data-test="home-search-input"
            placeholder={`Search by address / txn hash / block number${
              provider._network.getPlugin(
                "org.ethers.plugins.network.Ens",
              ) !== null
                ? " / ENS name"
                : ""
            }`}
            onChange={handleChange}
            ref={searchRef}
            autoFocus
          />
          <button
            className="rounded-r-lg bg-blue-600 px-4 py-3 text-white hover:bg-blue-700 focus:outline-none"
            type="button"
            onClick={() => setScanning(true)}
            title="Scan an ETH address using your camera"
          >
            <FontAwesomeIcon icon={faQrcode} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default memo(HomeHeroSection);
