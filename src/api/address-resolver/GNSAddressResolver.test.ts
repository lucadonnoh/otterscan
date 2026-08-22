import { describe, expect, jest, test } from "@jest/globals";
import { Interface, JsonRpcApiProvider } from "ethers";
import { GNSAddressResolver } from "./GNSAddressResolver";

const NAME_NFT_ADDRESS = "0x9D51D507BC7264d4fE8Ad1cf7Fe191933A0a81d6";
const NAME_NFT_INTERFACE = new Interface([
  "function reverseResolve(address addr) view returns (string)",
]);

const mockProvider = (chainId: bigint, response?: string) => {
  const call = jest.fn<JsonRpcApiProvider["call"]>();
  if (response !== undefined) {
    call.mockResolvedValue(response);
  }
  return {
    call,
    provider: {
      _network: { chainId },
      call,
    } as unknown as JsonRpcApiProvider,
  };
};

describe("GNSAddressResolver", () => {
  test("resolves an address to its primary .gwei name", async () => {
    const address = "0xc04689227fa24785609b1174698dbe481437f1a3";
    const { call, provider } = mockProvider(
      1n,
      NAME_NFT_INTERFACE.encodeFunctionResult("reverseResolve", [
        "donnoh.gwei",
      ]),
    );
    const resolver = new GNSAddressResolver();

    await expect(resolver.resolveAddress(provider, address)).resolves.toBe(
      "donnoh.gwei",
    );
    expect(call).toHaveBeenCalledWith({
      to: NAME_NFT_ADDRESS,
      data: NAME_NFT_INTERFACE.encodeFunctionData("reverseResolve", [address]),
    });
    expect(resolver.trusted("donnoh.gwei")).toBe(true);
  });

  test("returns undefined when there is no primary name", async () => {
    const { provider } = mockProvider(
      11155111n,
      NAME_NFT_INTERFACE.encodeFunctionResult("reverseResolve", [""]),
    );

    await expect(
      new GNSAddressResolver().resolveAddress(
        provider,
        "0x1d9640c0858b26b625dcdbee8d6e12fa88e55880",
      ),
    ).resolves.toBeUndefined();
  });

  test("skips unsupported networks without making a call", async () => {
    const { call, provider } = mockProvider(10n);

    await expect(
      new GNSAddressResolver().resolveAddress(
        provider,
        "0xc04689227fa24785609b1174698dbe481437f1a3",
      ),
    ).resolves.toBeUndefined();
    expect(call).not.toHaveBeenCalled();
  });
});
