import { describe, expect, jest, test } from "@jest/globals";
import { Interface, JsonRpcApiProvider, getAddress } from "ethers";
import {
  isGNSName,
  resolveGNSName,
  reverseResolveGNSAddress,
  supportsGNS,
} from "./GNSNameResolver";

const NAME_NFT_ADDRESS = "0x9D51D507BC7264d4fE8Ad1cf7Fe191933A0a81d6";
const NAME_NFT_INTERFACE = new Interface([
  "function computeId(string name) view returns (uint256)",
  "function resolve(uint256 tokenId) view returns (address)",
  "function reverseResolve(address addr) view returns (string)",
]);

const mockProvider = (...responses: string[]) => {
  const call = jest.fn<JsonRpcApiProvider["call"]>();
  responses.forEach((response) => call.mockResolvedValueOnce(response));
  return {
    call,
    provider: { call } as unknown as Pick<JsonRpcApiProvider, "call">,
  };
};

describe("GNS name resolution", () => {
  test("recognizes non-empty .gwei names case-insensitively", () => {
    expect(isGNSName("gns.gwei")).toBe(true);
    expect(isGNSName("Sub.Name.GWEI")).toBe(true);
    expect(isGNSName(".gwei")).toBe(false);
    expect(isGNSName("gns.gwei.eth")).toBe(false);
  });

  test("supports Ethereum mainnet and Sepolia", () => {
    expect(supportsGNS(1n)).toBe(true);
    expect(supportsGNS(11155111n)).toBe(true);
    expect(supportsGNS(10n)).toBe(false);
  });

  test("resolves through computeId and resolve", async () => {
    const tokenId = 123n;
    const resolvedAddress = "0xbbbce157ecbb945b1f92af88413b911910c727c8";
    const { call, provider } = mockProvider(
      NAME_NFT_INTERFACE.encodeFunctionResult("computeId", [tokenId]),
      NAME_NFT_INTERFACE.encodeFunctionResult("resolve", [resolvedAddress]),
    );

    await expect(resolveGNSName(provider, 1n, "gns.gwei")).resolves.toBe(
      getAddress(resolvedAddress),
    );
    expect(call).toHaveBeenNthCalledWith(1, {
      to: NAME_NFT_ADDRESS,
      data: NAME_NFT_INTERFACE.encodeFunctionData("computeId", ["gns.gwei"]),
    });
    expect(call).toHaveBeenNthCalledWith(2, {
      to: NAME_NFT_ADDRESS,
      data: NAME_NFT_INTERFACE.encodeFunctionData("resolve", [tokenId]),
    });
  });

  test("does not call the contract for unsupported inputs", async () => {
    const { call, provider } = mockProvider();

    await expect(resolveGNSName(provider, 10n, "gns.gwei")).resolves.toBeNull();
    await expect(
      resolveGNSName(provider, 1n, "vitalik.eth"),
    ).resolves.toBeNull();
    expect(call).not.toHaveBeenCalled();
  });

  test("returns null for an unset name", async () => {
    const { provider } = mockProvider(
      NAME_NFT_INTERFACE.encodeFunctionResult("computeId", [123n]),
      NAME_NFT_INTERFACE.encodeFunctionResult("resolve", [
        "0x0000000000000000000000000000000000000000",
      ]),
    );

    await expect(
      resolveGNSName(provider, 1n, "missing.gwei"),
    ).resolves.toBeNull();
  });

  test("returns null when a contract call fails", async () => {
    const call = jest
      .fn<JsonRpcApiProvider["call"]>()
      .mockRejectedValue(new Error("RPC unavailable"));
    const provider = { call } as unknown as Pick<JsonRpcApiProvider, "call">;

    await expect(resolveGNSName(provider, 1n, "gns.gwei")).resolves.toBeNull();
  });

  test("reverse resolves a primary name", async () => {
    const address = "0xc04689227fa24785609b1174698dbe481437f1a3";
    const { call, provider } = mockProvider(
      NAME_NFT_INTERFACE.encodeFunctionResult("reverseResolve", [
        "donnoh.gwei",
      ]),
    );

    await expect(reverseResolveGNSAddress(provider, 1n, address)).resolves.toBe(
      "donnoh.gwei",
    );
    expect(call).toHaveBeenCalledWith({
      to: NAME_NFT_ADDRESS,
      data: NAME_NFT_INTERFACE.encodeFunctionData("reverseResolve", [address]),
    });
  });

  test("returns null when an address has no primary name", async () => {
    const { provider } = mockProvider(
      NAME_NFT_INTERFACE.encodeFunctionResult("reverseResolve", [""]),
    );

    await expect(
      reverseResolveGNSAddress(
        provider,
        1n,
        "0x1d9640c0858b26b625dcdbee8d6e12fa88e55880",
      ),
    ).resolves.toBeNull();
  });

  test("does not reverse resolve on unsupported networks", async () => {
    const { call, provider } = mockProvider();

    await expect(
      reverseResolveGNSAddress(
        provider,
        10n,
        "0xc04689227fa24785609b1174698dbe481437f1a3",
      ),
    ).resolves.toBeNull();
    expect(call).not.toHaveBeenCalled();
  });
});
