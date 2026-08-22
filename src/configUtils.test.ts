import { describe, expect, test } from "@jest/globals";
import { normalizeOtterscanConfig } from "./configUtils";

describe("normalizeOtterscanConfig", () => {
  test.each([undefined, "", "   "])(
    "disables a blank Beacon API URL (%p)",
    (beaconAPI) => {
      expect(normalizeOtterscanConfig({ beaconAPI })).toEqual({
        beaconAPI: undefined,
      });
    },
  );

  test("trims and preserves a configured Beacon API URL", () => {
    expect(
      normalizeOtterscanConfig({
        erigonURL: "/rpc",
        beaconAPI: "  https://beacon.example  ",
      }),
    ).toEqual({
      erigonURL: "/rpc",
      beaconAPI: "https://beacon.example",
    });
  });
});
