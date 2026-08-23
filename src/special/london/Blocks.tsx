import {
  faBurn,
  faCoins,
  faCube,
  faGasPump,
  faHistory,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Transition } from "@headlessui/react";
import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from "chart.js";
import { Block, FixedNumber } from "ethers";
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Line } from "react-chartjs-2";
import { useBeaconSpec, useGenesisTime } from "../../useConsensus";
import { ExtendedBlock, readBlock } from "../../useErigonHooks";
import { RuntimeContext } from "../../useRuntime";
import BlockRow from "./BlockRow";
import {
  burntFeesChartData,
  burntFeesChartOptions,
  gasChartData,
  gasChartOptions,
} from "./chart";
import {
  BlockSupply,
  ConsensusIssuance,
  calculateBlockSupply,
  elapsedSlots,
  executionTimestampToSlot,
  fetchConsensusIssuance,
  normalizeConsensusIssuanceEndpoint,
} from "./issuance";

ChartJS.register(
  LinearScale,
  CategoryScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
);

const MAX_BLOCK_HISTORY = 20;

const PREV_BLOCK_COUNT = 15;

type BlocksProps = {
  latestBlock: Block;
};

const Blocks: React.FC<BlocksProps> = ({ latestBlock }) => {
  const { provider, config } = useContext(RuntimeContext);
  const [blocks, setBlocks] = useState<ExtendedBlock[]>([]);
  const [issuanceByBlock, setIssuanceByBlock] = useState<
    Record<number, ConsensusIssuance>
  >({});
  const pendingIssuance = useRef(new Set<number>());
  const [toggleChart, setToggleChart] = useState<boolean>(true);
  const genesisTime = useGenesisTime();
  const beaconSpec = useBeaconSpec();
  const secondsPerSlot = Number(beaconSpec?.SECONDS_PER_SLOT ?? 12);
  const issuanceEndpoint = normalizeConsensusIssuanceEndpoint(
    config.monitoring?.consensusIssuanceEndpoint,
  );

  const addBlock = useCallback(
    async (blockNumber: number) => {
      const extBlock = await readBlock(provider, blockNumber.toString());
      setBlocks((_blocks) => {
        for (let i = 0; i < _blocks.length; i++) {
          if (_blocks[i].number === blockNumber) {
            // Block already in list
            return _blocks;
          }
        }
        if (extBlock === null) {
          return _blocks;
        }

        // Leave the last block because of transition animation
        const newBlocks = [extBlock, ..._blocks].slice(
          0,
          MAX_BLOCK_HISTORY + 1,
        );

        // Little hack to fix out of order block notifications
        newBlocks.sort((a, b) => b.number - a.number);
        return newBlocks;
      });
    },
    [provider],
  );

  useEffect(() => {
    addBlock(latestBlock.number);
  }, [addBlock, latestBlock]);

  useEffect(() => {
    if (
      issuanceEndpoint === undefined ||
      genesisTime === undefined ||
      !Number.isFinite(secondsPerSlot) ||
      secondsPerSlot <= 0
    ) {
      return;
    }
    for (const block of blocks) {
      if (
        issuanceByBlock[block.number] !== undefined ||
        pendingIssuance.current.has(block.number)
      ) {
        continue;
      }
      const slot = executionTimestampToSlot(
        block.timestamp,
        genesisTime,
        secondsPerSlot,
      );
      pendingIssuance.current.add(block.number);
      void fetchConsensusIssuance(issuanceEndpoint, slot)
        .then((issuance) => {
          if (issuance.slot === slot) {
            setIssuanceByBlock((current) => ({
              ...current,
              [block.number]: issuance,
            }));
          }
        })
        .catch(() => undefined)
        .finally(() => pendingIssuance.current.delete(block.number));
    }
  }, [blocks, genesisTime, issuanceByBlock, issuanceEndpoint, secondsPerSlot]);

  useEffect(() => {
    const retained = new Set(blocks.map((block) => block.number));
    setIssuanceByBlock((current) => {
      const entries = Object.entries(current).filter(([blockNumber]) =>
        retained.has(Number(blockNumber)),
      );
      return entries.length === Object.keys(current).length
        ? current
        : Object.fromEntries(entries);
    });
  }, [blocks]);

  const supplyByBlock = useMemo(() => {
    const supply: Record<number, BlockSupply> = {};
    blocks.forEach((block, index) => {
      const issuance = issuanceByBlock[block.number];
      if (issuance === undefined || block.baseFeePerGas === null) {
        return;
      }
      supply[block.number] = calculateBlockSupply(
        issuance,
        elapsedSlots(
          block.timestamp,
          blocks[index + 1]?.timestamp,
          secondsPerSlot,
        ),
        block.gasUsed,
        block.baseFeePerGas,
      );
    });
    return supply;
  }, [blocks, issuanceByBlock, secondsPerSlot]);

  const data = useMemo(
    () =>
      toggleChart
        ? gasChartData(blocks)
        : burntFeesChartData(blocks, supplyByBlock),
    [toggleChart, blocks, supplyByBlock],
  );
  const chartOptions = toggleChart ? gasChartOptions : burntFeesChartOptions;

  // On page reload, pre-populate the last N blocks
  useEffect(
    () => {
      const addPreviousBlocks = async () => {
        for (
          let i = latestBlock.number - PREV_BLOCK_COUNT;
          i < latestBlock.number;
          i++
        ) {
          await addBlock(i);
        }
      };

      setBlocks([]);
      addPreviousBlocks();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return (
    <div className="w-full grow">
      <div className="divide-y-2 px-9 pb-12 pt-3">
        <div className="relative">
          <div className="flex items-baseline justify-center space-x-2 px-3 pb-2 text-xl text-gray-800">
            Latest Blocks
          </div>
          <div className="absolute right-0 top-0 rounded-sm border px-2 py-1 text-sm text-link-blue shadow-md hover:bg-gray-50 hover:text-link-blue-hover">
            <button onClick={() => setToggleChart(!toggleChart)}>
              {toggleChart ? "Gas usage" : "Burn vs issuance"}
            </button>
          </div>
        </div>
        <div>
          <Line data={data} height={100} options={chartOptions} />
        </div>
        <div className="mt-5 grid grid-cols-9 gap-x-2 px-3 py-2">
          <div className="flex items-baseline space-x-1">
            <span className="text-gray-500">
              <FontAwesomeIcon icon={faCube} />
            </span>
            <span>Block</span>
          </div>
          <div className="col-span-2 flex items-baseline justify-end space-x-1 text-right">
            <span className="text-gray-500">
              <FontAwesomeIcon icon={faGasPump} />
            </span>
            <span>Gas used</span>
          </div>
          <div className="text-right">Base fee</div>
          <div className="col-span-2 flex items-baseline justify-end space-x-1 text-right">
            <span className="text-amber-400">
              <FontAwesomeIcon icon={faCoins} />
            </span>
            <span title="Consensus issuance only: participation-adjusted attestation rewards plus proposer and sync committee rewards; priority fees and MEV are excluded">
              Issuance
            </span>
          </div>
          <div className="col-span-2 flex items-baseline justify-end space-x-1 text-right">
            <span className="text-orange-500">
              <FontAwesomeIcon icon={faBurn} />
            </span>
            <span>Burnt fees</span>
          </div>
          <div className="flex items-baseline justify-end space-x-1 text-right">
            <span className="text-gray-500">
              <FontAwesomeIcon icon={faHistory} />
            </span>
            <span>Age</span>
          </div>
        </div>
        {blocks.map((b, i, all) => (
          <Transition
            as="div"
            key={b.hash}
            show={i < MAX_BLOCK_HISTORY}
            appear
            enter="transition ease-out duration-500"
            enterFrom="opacity-0 -translate-y-10"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-out duration-1000"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-10"
          >
            <BlockRow
              block={b}
              supply={supplyByBlock[b.number]}
              baseFeeDelta={
                i < all.length - 1
                  ? FixedNumber.fromValue(b.baseFeePerGas!)
                      .divUnsafe(FixedNumber.fromValue(1e9))
                      .round(0)
                      .subUnsafe(
                        FixedNumber.fromValue(all[i + 1].baseFeePerGas!)
                          .divUnsafe(FixedNumber.fromValue(1e9))
                          .round(0),
                      )
                      .toUnsafeFloat()
                  : 0
              }
            />
          </Transition>
        ))}
      </div>
    </div>
  );
};

export default React.memo(Blocks);
