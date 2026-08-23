import { gasTooltipColor } from "./chart";

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
