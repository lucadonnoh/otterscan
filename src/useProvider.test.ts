import { describe, expect, test } from "@jest/globals";
import { getJsonRpcBatchOptions, getJsonRpcFetchRequest } from "./useProvider";

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

describe("getJsonRpcFetchRequest", () => {
  test("does not automatically retry HTTP rate limits", async () => {
    const request = getJsonRpcFetchRequest("https://example.com/rpc");

    expect(request.url).toBe("https://example.com/rpc");
    expect(request.retryFunc).not.toBeNull();
    await expect(
      request.retryFunc!(request, undefined as never, 0),
    ).resolves.toBe(false);
  });
});
