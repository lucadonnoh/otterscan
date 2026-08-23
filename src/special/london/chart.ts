import {
  ChartData,
  ChartOptions,
  TooltipItem,
  TooltipLabelStyle,
} from "chart.js";
import { ExtendedBlock } from "../../useErigonHooks";
import { commify } from "../../utils/utils";

const BURNT_FEES_COLOR = "#FB923C";
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

export const burntFeesChartOptions: ChartOptions<"line"> = {
  animation: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      callbacks: {
        labelColor: (context) =>
          tooltipLabelStyle(
            context.datasetIndex === 0 ? BURNT_FEES_COLOR : BASE_FEE_COLOR,
          ),
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
        text: "Burnt fees",
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
): ChartData<"line"> => ({
  labels: blocks.map((b) => b.number.toString()).reverse(),
  datasets: [
    {
      label: "Burnt fees (Gwei)",
      data: blocks
        .map((b) => Number((b.gasUsed * b.baseFeePerGas!) / 10n ** 9n))
        .reverse(),
      fill: true,
      backgroundColor: "#FDBA7470",
      borderColor: BURNT_FEES_COLOR,
      tension: 0.2,
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
