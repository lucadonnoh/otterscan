import { ensRenderer } from "../../execution/address/renderer/ENSName";
import { gnsRenderer } from "../../execution/address/renderer/GNSName";
import { plainStringRenderer } from "../../execution/address/renderer/PlainString";
import { tokenRenderer } from "../../execution/address/renderer/TokenName";
import { uniswapV1PairRenderer } from "../../execution/address/renderer/UniswapV1ExchangeName";
import { uniswapV2PairRenderer } from "../../execution/address/renderer/UniswapV2PairName";
import { uniswapV3PairRenderer } from "../../execution/address/renderer/UniswapV3PoolName";
import { SelectedResolvedName } from "./CompositeAddressResolver";
import { AddressResolver, ResolvedAddressRenderer } from "./address-resolver";
import {
  customLabelResolver,
  ensResolver,
  ercTokenResolver,
  gnsResolver,
  hardcodedResolver,
  uniswapV1Resolver,
  uniswapV2Resolver,
  uniswapV3Resolver,
} from "./resolvers";

export { customLabelResolver, getNameResolver, getResolver } from "./resolvers";

export type ResolvedAddresses = Record<string, SelectedResolvedName<any>>;

export const resolverRendererRegistry = new Map<
  AddressResolver<any>,
  ResolvedAddressRenderer<any>
>();
resolverRendererRegistry.set(ensResolver, ensRenderer);
resolverRendererRegistry.set(gnsResolver, gnsRenderer);
resolverRendererRegistry.set(uniswapV1Resolver, uniswapV1PairRenderer);
resolverRendererRegistry.set(uniswapV2Resolver, uniswapV2PairRenderer);
resolverRendererRegistry.set(uniswapV3Resolver, uniswapV3PairRenderer);
resolverRendererRegistry.set(ercTokenResolver, tokenRenderer);
resolverRendererRegistry.set(hardcodedResolver, plainStringRenderer);
resolverRendererRegistry.set(customLabelResolver, plainStringRenderer);
