import { JsonRpcApiProvider } from "ethers";
import { reverseResolveGNSAddress } from "../name-resolver/GNSNameResolver";
import { BasicAddressResolver } from "./address-resolver";

export class GNSAddressResolver extends BasicAddressResolver {
  async resolveAddress(
    provider: JsonRpcApiProvider,
    address: string,
  ): Promise<string | undefined> {
    const name = await reverseResolveGNSAddress(
      provider,
      provider._network.chainId,
      address,
    );
    return name ?? undefined;
  }

  trusted(resolvedAddress: string | undefined): boolean | undefined {
    return true;
  }
}
