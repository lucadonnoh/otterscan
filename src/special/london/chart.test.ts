import { ExtendedBlock } from "../../useErigonHooks";
import {
  burntFeesChartData,
  burntFeesTooltipColor,
  gasTooltipColor,
} from "./chart";
import { BlockSupply } from "./issuance";

describe("gasTooltipColor", () => {
  test("matches the dynamic gas-used line color", () => {
    expect(gasTooltipColor(0, 60_000_000, 60_000_000)).toBe("#0000ff");
    expect(gasTooltipColor(0, 30_000_000, 60_000_000)).toBe("#7f7fff");
  });

  test.each([
    [1, "#FCA5A5"],
    [2, "#B91C1CF0"],
    [3, "#38BDF8"],
  ])("matches dataset %i to its line color", (datasetIndex, color) => {
    expect(gasTooltipColor(datasetIndex, 0, 1)).toBe(color);
  });
});

describe("burn and issuance tooltip colors", () => {
  test.each([
    [0, "#FB923C"],
    [1, "#8B5CF6"],
    [2, "#38BDF8"],
    [3, "#10B981"],
  ])("matches dataset %i to its line color", (datasetIndex, color) => {
    expect(burntFeesTooltipColor(datasetIndex)).toBe(color);
  });

  test("plots burn, issuance, current base fee, and strict threshold", () => {
    const block = {
      number: 25_817_935,
      gasUsed: 30_000_000n,
      baseFeePerGas: 14_000_000_000n,
    } as ExtendedBlock;
    const supply: BlockSupply = {
      issuanceWei: 407_042_555_000_000_000n,
      burntWei: 420_000_000_000_000_000n,
      deflationary: true,
      breakEvenBaseFeeGwei: 13.5680851667,
      minimumDeflationaryBaseFeeWei: 13_568_085_167n,
      slotsElapsed: 1,
    };

    const data = burntFeesChartData([block], { [block.number]: supply });

    expect(data.labels).toEqual(["25817935"]);
    expect(data.datasets.map((dataset) => dataset.label)).toEqual([
      "Burn",
      "Consensus issuance (estimated)",
      "Base fee",
      "Deflationary above",
    ]);
    expect(data.datasets[0].data).toEqual([420_000_000]);
    expect(data.datasets[1].data).toEqual([407_042_555]);
    expect(data.datasets[2].data).toEqual([14_000_000_000]);
    expect(data.datasets[3].data).toEqual([13_568_085_167]);
  });
});
