import { describe, expect, jest, test } from "@jest/globals";
import { JsonRpcApiProvider } from "ethers";
import { getCodeQuery, hasCodeQuery } from "./useErigonHooks";

jest.mock("./abi/erc20.json", () => ({
  __esModule: true,
  default: [],
}));
jest.mock("./abi/optimism/L1Block.json", () => ({
  __esModule: true,
  default: [],
}));

const provider = {} as JsonRpcApiProvider;

describe("optional address RPC queries", () => {
  test("does not issue code queries before an address is available", () => {
    expect(hasCodeQuery(provider, undefined).enabled).toBe(false);
    expect(getCodeQuery(provider, undefined).enabled).toBe(false);
  });

  test("enables code queries for a resolved address", () => {
    const address = "0x9D51D507BC7264d4fE8Ad1cf7Fe191933A0a81d6";

    expect(hasCodeQuery(provider, address).enabled).toBe(true);
    expect(getCodeQuery(provider, address).enabled).toBe(true);
  });
});
