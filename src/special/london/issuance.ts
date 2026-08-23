const GWEI_TO_WEI = 1_000_000_000n;
const EIP1559_ELASTICITY_MULTIPLIER = 2n;

export type ConsensusIssuance = {
  slot: number;
  sourceEpoch: number;
  attestationIssuanceGweiPerEpoch: bigint;
  attestationIssuanceGweiPerSlot: bigint;
  blockProposerIssuanceGwei: bigint;
  syncCommitteeIssuanceGwei: bigint;
};

export type BlockSupply = {
  issuanceWei: bigint;
  burntWei: bigint;
  deflationary: boolean;
  targetBreakEvenBaseFeeGwei: number;
  minimumTargetDeflationaryBaseFeeWei: bigint;
  slotsElapsed: number;
};

export const eip1559GasTarget = (gasLimit: bigint): bigint =>
  gasLimit / EIP1559_ELASTICITY_MULTIPLIER;

const parseInteger = (value: unknown, field: string): bigint => {
  if (typeof value !== "string" || !/^[0-9]+$/.test(value)) {
    throw new Error(`Invalid consensus issuance field: ${field}`);
  }
  return BigInt(value);
};

const parseSafeNumber = (value: unknown, field: string): number => {
  const parsed = Number(parseInteger(value, field));
  if (!Number.isSafeInteger(parsed)) {
    throw new Error(`Consensus issuance field is too large: ${field}`);
  }
  return parsed;
};

export const normalizeConsensusIssuanceEndpoint = (
  endpoint: string | undefined,
): string | undefined => {
  const value = endpoint?.trim().replace(/\/+$/, "");
  if (
    !value ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("?") ||
    value.includes("#")
  ) {
    return undefined;
  }
  return value;
};

export const parseConsensusIssuance = (payload: unknown): ConsensusIssuance => {
  if (
    typeof payload !== "object" ||
    payload === null ||
    !("data" in payload) ||
    typeof payload.data !== "object" ||
    payload.data === null
  ) {
    throw new Error("Invalid consensus issuance response");
  }
  const data = payload.data as Record<string, unknown>;
  return {
    slot: parseSafeNumber(data.slot, "slot"),
    sourceEpoch: parseSafeNumber(data.source_epoch, "source_epoch"),
    attestationIssuanceGweiPerEpoch: parseInteger(
      data.attestation_issuance_gwei_per_epoch,
      "attestation_issuance_gwei_per_epoch",
    ),
    attestationIssuanceGweiPerSlot: parseInteger(
      data.attestation_issuance_gwei_per_slot,
      "attestation_issuance_gwei_per_slot",
    ),
    blockProposerIssuanceGwei: parseInteger(
      data.block_proposer_issuance_gwei,
      "block_proposer_issuance_gwei",
    ),
    syncCommitteeIssuanceGwei: parseInteger(
      data.sync_committee_issuance_gwei,
      "sync_committee_issuance_gwei",
    ),
  };
};

export const fetchConsensusIssuance = async (
  endpoint: string,
  slot: number,
): Promise<ConsensusIssuance> => {
  const response = await fetch(`${endpoint}/${slot}`, {
    cache: "force-cache",
    credentials: "omit",
  });
  if (!response.ok) {
    throw new Error(`Consensus issuance request failed: ${response.status}`);
  }
  return parseConsensusIssuance(await response.json());
};

export const executionTimestampToSlot = (
  timestamp: number,
  genesisTime: number,
  secondsPerSlot: number,
): number => {
  if (secondsPerSlot <= 0 || timestamp < genesisTime) {
    throw new Error("Invalid slot timing configuration");
  }
  return Math.floor((timestamp - genesisTime) / secondsPerSlot);
};

export const elapsedSlots = (
  timestamp: number,
  previousTimestamp: number | undefined,
  secondsPerSlot: number,
): number => {
  if (previousTimestamp === undefined || secondsPerSlot <= 0) {
    return 1;
  }
  return Math.max(
    1,
    Math.round((timestamp - previousTimestamp) / secondsPerSlot),
  );
};

export const calculateBlockSupply = ({
  issuance,
  slotsElapsed,
  gasUsed,
  gasTarget,
  baseFeePerGas,
}: {
  issuance: ConsensusIssuance;
  slotsElapsed: number;
  gasUsed: bigint;
  gasTarget: bigint;
  baseFeePerGas: bigint;
}): BlockSupply => {
  if (gasUsed < 0n || gasTarget <= 0n) {
    throw new Error("Invalid gas values for supply calculation");
  }
  const normalizedSlotsElapsed = Math.max(1, Math.trunc(slotsElapsed));
  const issuanceGwei =
    issuance.attestationIssuanceGweiPerSlot * BigInt(normalizedSlotsElapsed) +
    issuance.blockProposerIssuanceGwei +
    issuance.syncCommitteeIssuanceGwei;
  const issuanceWei = issuanceGwei * GWEI_TO_WEI;
  const burntWei = gasUsed * baseFeePerGas;
  return {
    issuanceWei,
    burntWei,
    deflationary: burntWei > issuanceWei,
    targetBreakEvenBaseFeeGwei: Number(issuanceGwei) / Number(gasTarget),
    minimumTargetDeflationaryBaseFeeWei: issuanceWei / gasTarget + 1n,
    slotsElapsed: normalizedSlotsElapsed,
  };
};
