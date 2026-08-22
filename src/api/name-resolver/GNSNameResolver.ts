import { Interface, JsonRpcApiProvider, getAddress } from "ethers";
import { ChecksummedAddress, ZERO_ADDRESS } from "../../types";

const NAME_NFT_ADDRESS = "0x9D51D507BC7264d4fE8Ad1cf7Fe191933A0a81d6";
const NAME_NFT_ADDRESSES = new Map<bigint, string>([
  [1n, NAME_NFT_ADDRESS],
  [11155111n, NAME_NFT_ADDRESS],
]);

const NAME_NFT_INTERFACE = new Interface([
  "function computeId(string name) view returns (uint256)",
  "function resolve(uint256 tokenId) view returns (address)",
  "function reverseResolve(address addr) view returns (string)",
]);

type CallProvider = Pick<JsonRpcApiProvider, "call">;

export const isGNSName = (name: string): boolean => {
  const normalizedName = name.toLowerCase();
  return normalizedName.length > 5 && normalizedName.endsWith(".gwei");
};

export const supportsGNS = (chainId: bigint): boolean =>
  NAME_NFT_ADDRESSES.has(chainId);

export const resolveGNSName = async (
  provider: CallProvider,
  chainId: bigint,
  name: string,
): Promise<ChecksummedAddress | null> => {
  const contractAddress = NAME_NFT_ADDRESSES.get(chainId);
  if (contractAddress === undefined || !isGNSName(name)) {
    return null;
  }

  try {
    const computeIdResult = await provider.call({
      to: contractAddress,
      data: NAME_NFT_INTERFACE.encodeFunctionData("computeId", [name]),
    });
    const [tokenId] = NAME_NFT_INTERFACE.decodeFunctionResult(
      "computeId",
      computeIdResult,
    );

    const resolveResult = await provider.call({
      to: contractAddress,
      data: NAME_NFT_INTERFACE.encodeFunctionData("resolve", [tokenId]),
    });
    const [resolvedAddress] = NAME_NFT_INTERFACE.decodeFunctionResult(
      "resolve",
      resolveResult,
    );

    if (
      typeof resolvedAddress !== "string" ||
      resolvedAddress === ZERO_ADDRESS
    ) {
      return null;
    }
    return getAddress(resolvedAddress);
  } catch {
    return null;
  }
};

export const reverseResolveGNSAddress = async (
  provider: CallProvider,
  chainId: bigint,
  address: string,
): Promise<string | null> => {
  const contractAddress = NAME_NFT_ADDRESSES.get(chainId);
  if (contractAddress === undefined) {
    return null;
  }

  try {
    const reverseResolveResult = await provider.call({
      to: contractAddress,
      data: NAME_NFT_INTERFACE.encodeFunctionData("reverseResolve", [address]),
    });
    const [name] = NAME_NFT_INTERFACE.decodeFunctionResult(
      "reverseResolve",
      reverseResolveResult,
    );

    if (typeof name !== "string" || name === "") {
      return null;
    }
    return name;
  } catch {
    return null;
  }
};
