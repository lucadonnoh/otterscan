import { Meta, StoryObj } from "@storybook/react-vite";
import { ProcessedTransaction } from "../types";
import HomeFeed from "./HomeFeed";
import { HomeBlockSummary, HomeFeed as HomeFeedData } from "./useHomeFeed";

const now = Math.floor(Date.now() / 1_000);
const latestBlockNumber = 25_813_707;

const blocks: HomeBlockSummary[] = Array.from({ length: 6 }, (_, index) => ({
  number: latestBlockNumber - index,
  timestamp: now - index * 12,
  feeRecipient: "0x95222290DD7278Aa3Ddd389Cc1E1d165CC4BAfe5",
  transactionCount: 181 + index * 23,
  gasUsed: 18_000_000n + BigInt(index * 1_000_000),
  gasLimit: 36_000_000n,
  baseFeePerGas: 66_000_000n,
}));

const transactions: ProcessedTransaction[] = Array.from(
  { length: 6 },
  (_, index) => ({
    blockNumber: latestBlockNumber,
    timestamp: now - 4,
    miner: "0x95222290DD7278Aa3Ddd389Cc1E1d165CC4BAfe5",
    idx: index,
    hash: `0x${(index + 1).toString(16).padStart(64, "0")}`,
    from: "0x7a54DcfB2C69dF6aB81b196F2E05f43271dBdC024",
    to: "0x3E07bE15e2D2dAed5e6ef59fCF0e51869497D524",
    value: BigInt(index) * 12_500_000_000_000_000n,
    type: 2,
    fee: 1_000_000_000_000n,
    gasPrice: 66_000_000n,
    data: "0x",
    status: index === 4 ? 0 : 1,
  }),
);

const feed: HomeFeedData = {
  latestBlockNumber,
  blocks,
  transactions,
  transactionCount: 181,
  blocksLoading: false,
  transactionsLoading: false,
  blocksUnavailable: false,
  transactionsUnavailable: false,
};

const meta = {
  component: HomeFeed,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-slate-50 p-5">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof HomeFeed>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Mainnet: Story = {
  args: {
    networkName: "Ethereum Mainnet",
    chainId: 1n,
    nativeSymbol: "ETH",
    nativeDecimals: 18,
    finalizedSlotNumber: 12_345_678,
    finalizedSlotTimestamp: now - 120,
    feed,
  },
};
