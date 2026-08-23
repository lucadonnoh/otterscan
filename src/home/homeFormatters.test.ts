import {
  formatGwei,
  formatNativeValue,
  gasUsedPercentage,
  recentBlockNumbers,
  shortenHex,
} from "./homeFormatters";

describe("home formatters", () => {
  test("shortens long hashes while preserving both ends", () => {
    expect(
      shortenHex(
        "0x91298d449f193df13d1ba23e6ea55e9f50b88b4fb9b373571b8cb33a07c2f879",
      ),
    ).toBe("0x91298d44…c2f879");
    expect(shortenHex("0x1234")).toBe("0x1234");
  });

  test("builds a descending block window without going below genesis", () => {
    expect(recentBlockNumbers(25_000_000, 3)).toEqual([
      25_000_000, 24_999_999, 24_999_998,
    ]);
    expect(recentBlockNumbers(2, 6)).toEqual([2, 1, 0]);
    expect(recentBlockNumbers(-1, 6)).toEqual([]);
  });

  test("formats base fees in gwei", () => {
    expect(formatGwei(undefined)).toBe("—");
    expect(formatGwei(0n)).toBe("0");
    expect(formatGwei(66_000_000n)).toBe("0.066");
    expect(formatGwei(12_340_000_000n)).toBe("12.34");
  });

  test("formats compact native token values", () => {
    expect(formatNativeValue(0n, "ETH")).toBe("0 ETH");
    expect(formatNativeValue(1_250_000_000_000_000_000n, "ETH")).toBe(
      "1.25 ETH",
    );
    expect(formatNativeValue(1n, "ETH")).toBe("<0.00001 ETH");
  });

  test("calculates gas utilization", () => {
    expect(gasUsedPercentage(15_000_000n, 30_000_000n)).toBe(50);
    expect(gasUsedPercentage(1n, 0n)).toBe(0);
  });
});
