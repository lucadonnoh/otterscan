import {
  afterAll,
  beforeAll,
  describe,
  expect,
  jest,
  test,
} from "@jest/globals";
import { Interface, JsonRpcApiProvider } from "ethers";
import { getNameResolver } from "./nameResolvers";

const GNS_INTERFACE = new Interface([
  "function reverseResolve(address addr) view returns (string)",
]);
const ADDRESS = "0x011CBC3F34B86538Ae5EBeFa30f1768006887162";
const originalLocalStorage = globalThis.localStorage;

beforeAll(() => {
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: { getItem: jest.fn(() => null) },
  });
});

afterAll(() => {
  if (originalLocalStorage === undefined) {
    delete (globalThis as { localStorage?: Storage }).localStorage;
  } else {
    Object.defineProperty(globalThis, "localStorage", {
      configurable: true,
      value: originalLocalStorage,
    });
  }
});

const mockProvider = (gnsName: string, ensName: string | null) => {
  const call = jest
    .fn<JsonRpcApiProvider["call"]>()
    .mockResolvedValue(
      GNS_INTERFACE.encodeFunctionResult("reverseResolve", [gnsName]),
    );
  const lookupAddress = jest
    .fn<JsonRpcApiProvider["lookupAddress"]>()
    .mockResolvedValue(ensName);
  return {
    call,
    lookupAddress,
    provider: {
      _network: { chainId: 1n },
      call,
      lookupAddress,
    } as unknown as JsonRpcApiProvider,
  };
};

describe("name-only address resolver", () => {
  test("prioritizes a .gwei name over ENS", async () => {
    const { lookupAddress, provider } = mockProvider(
      "priority.gwei",
      "fallback.eth",
    );

    const result = await getNameResolver(1n).resolveAddress(provider, ADDRESS);

    expect(result?.[1]).toBe("priority.gwei");
    expect(lookupAddress).not.toHaveBeenCalled();
  });

  test("stops after name and hardcoded labels without contract probes", async () => {
    const { call, lookupAddress, provider } = mockProvider("", null);

    await expect(
      getNameResolver(1n).resolveAddress(provider, ADDRESS),
    ).resolves.toBeNull();
    expect(call).toHaveBeenCalledTimes(1);
    expect(lookupAddress).toHaveBeenCalledTimes(1);
  });
});
