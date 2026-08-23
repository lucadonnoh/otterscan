import {
  calculateBlockSupply,
  eip1559GasTarget,
  elapsedSlots,
  executionTimestampToSlot,
  normalizeConsensusIssuanceEndpoint,
  parseConsensusIssuance,
} from "./issuance";

const issuance = parseConsensusIssuance({
  data: {
    slot: "15055571",
    source_epoch: "470485",
    attestation_issuance_gwei_per_epoch: "11024048889",
    attestation_issuance_gwei_per_slot: "344501527",
    block_proposer_issuance_gwei: "49717476",
    sync_committee_issuance_gwei: "12823552",
  },
});

describe("consensus issuance", () => {
  test("accepts only relative same-origin endpoint prefixes", () => {
    expect(normalizeConsensusIssuanceEndpoint(" /__ops/issuance/ ")).toBe(
      "/__ops/issuance",
    );
    expect(normalizeConsensusIssuanceEndpoint("https://example.com")).toBe(
      undefined,
    );
    expect(normalizeConsensusIssuanceEndpoint("//example.com")).toBe(undefined);
  });

  test("maps an execution timestamp to its Beacon slot", () => {
    expect(executionTimestampToSlot(1_787_490_000, 1_606_824_023, 12)).toBe(
      15_055_498,
    );
  });

  test("accounts for skipped slots between execution blocks", () => {
    expect(elapsedSlots(1_048, 1_000, 12)).toBe(4);
    expect(elapsedSlots(1_012, undefined, 12)).toBe(1);
  });

  test("derives each block's EIP-1559 gas target from its gas limit", () => {
    expect(eip1559GasTarget(60_000_000n)).toBe(30_000_000n);
    expect(eip1559GasTarget(60_000_002n)).toBe(30_000_001n);
  });

  test("compares actual burn with issuance and calculates the target-gas threshold", () => {
    const supply = calculateBlockSupply({
      issuance,
      slotsElapsed: 1,
      gasUsed: 30_000_000n,
      gasTarget: 30_000_000n,
      baseFeePerGas: 14_000_000_000n,
    });

    expect(supply.issuanceWei).toBe(407_042_555_000_000_000n);
    expect(supply.burntWei).toBe(420_000_000_000_000_000n);
    expect(supply.deflationary).toBe(true);
    expect(supply.targetBreakEvenBaseFeeGwei).toBeCloseTo(13.5680851667);
    expect(supply.minimumTargetDeflationaryBaseFeeWei).toBe(13_568_085_167n);
  });

  test("does not let low actual gas use inflate the target-gas threshold", () => {
    const supply = calculateBlockSupply({
      issuance,
      slotsElapsed: 1,
      gasUsed: 6_785_628n,
      gasTarget: 30_000_000n,
      baseFeePerGas: 14_000_000_000n,
    });

    expect(supply.targetBreakEvenBaseFeeGwei).toBeCloseTo(13.5680851667);
    expect(supply.minimumTargetDeflationaryBaseFeeWei).toBe(13_568_085_167n);
    expect(supply.burntWei).toBe(94_998_792_000_000_000n);
    expect(supply.deflationary).toBe(false);
  });

  test("adds attestation issuance for every elapsed slot", () => {
    const supply = calculateBlockSupply({
      issuance,
      slotsElapsed: 2,
      gasUsed: 30_000_000n,
      gasTarget: 30_000_000n,
      baseFeePerGas: 20_000_000_000n,
    });

    expect(supply.issuanceWei).toBe(751_544_082_000_000_000n);
    expect(supply.targetBreakEvenBaseFeeGwei).toBeCloseTo(25.0514694);
    expect(supply.deflationary).toBe(false);
  });
});
