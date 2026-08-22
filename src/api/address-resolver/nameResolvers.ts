import {
  CompositeAddressResolver,
  SelectedResolvedName,
} from "./CompositeAddressResolver";
import { CustomLabelResolver } from "./CustomLabelResolver";
import { ENSAddressResolver } from "./ENSAddressResolver";
import { GNSAddressResolver } from "./GNSAddressResolver";
import { HardcodedAddressResolver } from "./HardcodedAddressResolver";
import { AddressResolver } from "./address-resolver";

export const ensResolver = new ENSAddressResolver();
export const gnsResolver = new GNSAddressResolver();
export const hardcodedResolver = new HardcodedAddressResolver();
export const customLabelResolver = new CustomLabelResolver();

// Address-heavy views only need human-readable labels. Avoid probing every
// visible address as a Uniswap pair and ERC token; those contract metadata
// probes are useful on a selected address, but amplify RPC traffic in lists.
const mainnetNameResolver = new CompositeAddressResolver();
mainnetNameResolver.addResolver(customLabelResolver);
mainnetNameResolver.addResolver(gnsResolver);
mainnetNameResolver.addResolver(ensResolver);
mainnetNameResolver.addResolver(hardcodedResolver);

const defaultNameResolver = new CompositeAddressResolver();
defaultNameResolver.addResolver(customLabelResolver);
defaultNameResolver.addResolver(gnsResolver);
defaultNameResolver.addResolver(hardcodedResolver);

const nameResolvers: Record<
  string,
  AddressResolver<SelectedResolvedName<any>>
> = {
  "1": mainnetNameResolver,
  "0": defaultNameResolver,
};

export const getNameResolver = (
  chainId: bigint,
): AddressResolver<SelectedResolvedName<any>> =>
  nameResolvers[chainId.toString()] ?? nameResolvers["0"];
