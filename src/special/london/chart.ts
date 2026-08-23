import {
  ChartData,
  ChartOptions,
  TooltipItem,
  TooltipLabelStyle,
} from "chart.js";
import { ExtendedBlock } from "../../useErigonHooks";
import { commify } from "../../utils/utils";
import { BlockSupply } from "./issuance";

const BURNT_FEES_COLOR = "#FB923C";
const CONSENSUS_ISSUANCE_COLOR = "#8B5CF6";
const DEFLATIONARY_COLOR = "#10B981";
const GAS_TARGET_COLOR = "#FCA5A5";
const GAS_LIMIT_COLOR = "#B91C1CF0";
const BASE_FEE_COLOR = "#38BDF8";

function rgbToHex(red: number, green: number, blue: number): string {
  return `#${((red << 16) + (green << 8) + blue).toString(16).padStart(6, "0")}`;
}

function interpolateColor(gasUsed: number, gasLimit: number): string {
  const red = Math.floor(255 + (gasUsed / gasLimit) * (0 - 255));
  const green = Math.floor(255 + (gasUsed / gasLimit) * (0 - 255));
  const blue = 255;
  return rgbToHex(red, green, blue);
}

const tooltipLabelStyle = (color: string): TooltipLabelStyle => ({
  borderColor: color,
  backgroundColor: color,
  borderWidth: 2,
});

export const gasTooltipColor = (
  datasetIndex: number,
  gasUsed: number,
  gasLimit: number,
): string => {
  switch (datasetIndex) {
    case 0:
      return interpolateColor(gasUsed, gasLimit);
    case 1:
      return GAS_TARGET_COLOR;
    case 2:
      return GAS_LIMIT_COLOR;
    case 3:
      return BASE_FEE_COLOR;
    default:
      return "#6B7280";
  }
};

const gasTooltipLabelColor = (
  context: TooltipItem<"line">,
): TooltipLabelStyle => {
  const gasUsed = Number(
    context.chart.data.datasets[0].data[context.dataIndex],
  );
  const gasLimit = Number(
    context.chart.data.datasets[2].data[context.dataIndex],
  );
  return tooltipLabelStyle(
    gasTooltipColor(context.datasetIndex, gasUsed, gasLimit),
  );
};

export const burntFeesTooltipColor = (datasetIndex: number): string => {
  switch (datasetIndex) {
    case 0:
      return BURNT_FEES_COLOR;
    case 1:
      return CONSENSUS_ISSUANCE_COLOR;
    case 2:
      return BASE_FEE_COLOR;
    case 3:
      return DEFLATIONARY_COLOR;
    default:
      return "#6B7280";
  }
};

const chartNumber = (value: unknown): number | undefined => {
  if (value === null || value === undefined) {
    return undefined;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

export const burntFeesChartOptions: ChartOptions<"line"> = {
  animation: false,
  interaction: {
    mode: "index",
    intersect: false,
  },
  plugins: {
    legend: {
      display: true,
      labels: {
        usePointStyle: true,
        boxWidth: 8,
      },
    },
    tooltip: {
      callbacks: {
        labelColor: (context) =>
          tooltipLabelStyle(burntFeesTooltipColor(context.datasetIndex)),
        label: (context) => {
          const value = chartNumber(context.raw);
          if (value === undefined) {
            return `${context.dataset.label}: unavailable`;
          }
          if (context.datasetIndex <= 1) {
            return `${context.dataset.label}: ${commify((value / 1e9).toFixed(6))} ETH`;
          }
          return `${context.dataset.label}: ${commify((value / 1e9).toFixed(3))} Gwei`;
        },
        afterBody: (items) => {
          const dataIndex = items[0]?.dataIndex;
          if (dataIndex === undefined) {
            return "";
          }
          const burnt = chartNumber(
            items[0].chart.data.datasets[0].data[dataIndex],
          );
          const issuance = chartNumber(
            items[0].chart.data.datasets[1].data[dataIndex],
          );
          if (burnt === undefined || issuance === undefined) {
            return "";
          }
          const change = (issuance - burnt) / 1e9;
          const state =
            change < 0
              ? "deflationary"
              : change > 0
                ? "inflationary"
                : "neutral";
          const sign = change > 0 ? "+" : "";
          return `Supply change: ${sign}${commify(change.toFixed(6))} ETH (${state})`;
        },
      },
    },
  },
  scales: {
    x: {
      ticks: {
        callback: function (v) {
          // @ts-ignore
          return commify(this.getLabelForValue(v));
        },
      },
    },
    y: {
      beginAtZero: true,
      title: {
        display: true,
        text: "ETH per block interval",
      },
      ticks: {
        callback: (v) => `${(v as number) / 1e9} ETH`,
      },
    },
    yBaseFee: {
      position: "right",
      beginAtZero: true,
      title: {
        display: true,
        text: "Base fee",
      },
      ticks: {
        callback: (v) => `${(v as number) / 1e9} Gwei`,
      },
      grid: {
        drawOnChartArea: false,
      },
    },
  },
};

export const burntFeesChartData = (
  blocks: ExtendedBlock[],
  supplyByBlock: Readonly<Record<number, BlockSupply | undefined>>,
): ChartData<"line"> => ({
  labels: blocks.map((b) => b.number.toString()).reverse(),
  datasets: [
    {
      label: "Burn",
      data: blocks
        .map((b) => Number((b.gasUsed * b.baseFeePerGas!) / 10n ** 9n))
        .reverse(),
      fill: {
        target: 1,
        above: "#10B98135",
        below: "#FB923C25",
      },
      borderColor: BURNT_FEES_COLOR,
      pointBackgroundColor: blocks
        .map((b) =>
          supplyByBlock[b.number]?.deflationary
            ? DEFLATIONARY_COLOR
            : BURNT_FEES_COLOR,
        )
        .reverse(),
      tension: 0.2,
    },
    {
      label: "Consensus issuance (estimated)",
      data: blocks
        .map((b) => {
          const supply = supplyByBlock[b.number];
          return supply === undefined
            ? null
            : Number(supply.issuanceWei / 10n ** 9n);
        })
        .reverse(),
      borderColor: CONSENSUS_ISSUANCE_COLOR,
      backgroundColor: CONSENSUS_ISSUANCE_COLOR,
      tension: 0.2,
      spanGaps: true,
    },
    {
      label: "Base fee",
      data: blocks.map((b) => Number(b.baseFeePerGas!)).reverse(),
      yAxisID: "yBaseFee",
      borderColor: BASE_FEE_COLOR,
      backgroundColor: BASE_FEE_COLOR,
      tension: 0.2,
    },
    {
      label: "Target deflation threshold",
      data: blocks
        .map((b) => {
          const supply = supplyByBlock[b.number];
          return supply === undefined
            ? null
            : Number(supply.minimumTargetDeflationaryBaseFeeWei);
        })
        .reverse(),
      yAxisID: "yBaseFee",
      borderColor: DEFLATIONARY_COLOR,
      backgroundColor: DEFLATIONARY_COLOR,
      borderDash: [6, 4],
      pointStyle: "dash",
      tension: 0.2,
      spanGaps: true,
    },
  ],
});

export const gasChartOptions: ChartOptions<"line"> = {
  animation: false,
  interaction: {
    mode: "index",
    intersect: false,
  },
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      callbacks: {
        labelColor: gasTooltipLabelColor,
      },
    },
  },
  scales: {
    x: {
      ticks: {
        callback: function (v) {
          // @ts-ignore
          return commify(this.getLabelForValue(v));
        },
      },
    },
    y: {
      beginAtZero: true,
      title: {
        display: true,
        text: "Gas",
      },
    },
    yBaseFee: {
      position: "right",
      beginAtZero: true,
      title: {
        display: true,
        text: "Base fee",
      },
      ticks: {
        callback: (v) => `${(v as number) / 1e9} Gwei`,
      },
      grid: {
        drawOnChartArea: false,
      },
    },
  },
};

export const gasChartData = (blocks: ExtendedBlock[]): ChartData<"line"> => ({
  labels: blocks.map((b) => b.number.toString()).reverse(),
  datasets: [
    {
      label: "Gas used",
      data: blocks.map((b) => Number(b.gasUsed)).reverse(),
      fill: true,
      segment: {
        backgroundColor: (ctx, x) =>
          interpolateColor(
            ctx.p1.parsed.y,
            Number(blocks[ctx.p1DataIndex].gasLimit),
          ) + "70",
        borderColor: (ctx) =>
          interpolateColor(
            ctx.p1.parsed.y,
            Number(blocks[ctx.p1DataIndex].gasLimit),
          ),
      },
      tension: 0.2,
    },
    {
      label: "Gas target",
      data: blocks.map((b) => Math.round(Number(b.gasLimit) / 2)).reverse(),
      borderColor: GAS_TARGET_COLOR,
      borderDash: [5, 5],
      borderWidth: 2,
      tension: 0.2,
      pointStyle: "dash",
    },
    {
      label: "Gas limit",
      data: blocks.map((b) => Number(b.gasLimit)).reverse(),
      borderColor: GAS_LIMIT_COLOR,
      tension: 0.2,
      pointStyle: "crossRot",
      pointRadius: 5,
    },
    {
      label: "Base fee (wei)",
      data: blocks.map((b) => Number(b.baseFeePerGas!)).reverse(),
      yAxisID: "yBaseFee",
      borderColor: BASE_FEE_COLOR,
      tension: 0.2,
    },
  ],
});
