import {
  CompositeAddressResolver,
  SelectedResolvedName,
} from "./CompositeAddressResolver";
import { ERCTokenResolver } from "./ERCTokenResolver";
import { UniswapV1Resolver } from "./UniswapV1Resolver";
import { UniswapV2Resolver } from "./UniswapV2Resolver";
import { UniswapV3Resolver } from "./UniswapV3Resolver";
import { AddressResolver } from "./address-resolver";
import {
  customLabelResolver,
  ensResolver,
  gnsResolver,
  hardcodedResolver,
} from "./nameResolvers";

export const uniswapV1Resolver = new UniswapV1Resolver();
export const uniswapV2Resolver = new UniswapV2Resolver();
export const uniswapV3Resolver = new UniswapV3Resolver();
export const ercTokenResolver = new ERCTokenResolver();

export {
  customLabelResolver,
  ensResolver,
  getNameResolver,
  gnsResolver,
  hardcodedResolver,
} from "./nameResolvers";

const mainnetResolver = new CompositeAddressResolver();
mainnetResolver.addResolver(customLabelResolver);
mainnetResolver.addResolver(gnsResolver);
mainnetResolver.addResolver(ensResolver);
mainnetResolver.addResolver(hardcodedResolver);
mainnetResolver.addResolver(uniswapV3Resolver);
mainnetResolver.addResolver(uniswapV2Resolver);
mainnetResolver.addResolver(uniswapV1Resolver);
mainnetResolver.addResolver(ercTokenResolver);

const defaultResolver = new CompositeAddressResolver();
defaultResolver.addResolver(customLabelResolver);
defaultResolver.addResolver(gnsResolver);
defaultResolver.addResolver(hardcodedResolver);
defaultResolver.addResolver(ercTokenResolver);

const resolvers: Record<string, AddressResolver<SelectedResolvedName<any>>> = {
  "1": mainnetResolver,
  "0": defaultResolver,
};

export const getResolver = (
  chainId: bigint,
): AddressResolver<SelectedResolvedName<any>> =>
  resolvers[chainId.toString()] ?? resolvers["0"];
