import { describe, expect, test } from "@jest/globals";
import { getJsonRpcBatchOptions } from "./useProvider";

describe("getJsonRpcBatchOptions", () => {
  test("preserves the ethers default when unset", () => {
    expect(getJsonRpcBatchOptions()).toEqual({});
  });

  test("configures a positive batch limit", () => {
    expect(getJsonRpcBatchOptions(20)).toEqual({ batchMaxCount: 20 });
  });

  test.each([0, -1, 1.5, Number.NaN])(
    "rejects invalid batch limit %s",
    (batchMaxCount) => {
      expect(() => getJsonRpcBatchOptions(batchMaxCount)).toThrow(
        "rpcBatchMaxCount must be a positive integer",
      );
    },
  );
});
