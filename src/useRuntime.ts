import { JsonRpcApiProvider, JsonRpcProvider, Network } from "ethers";
import { createContext } from "react";
import { OtterscanConfig } from "./useConfig";
import {
  createAndProbeProvider,
  getJsonRpcBatchOptions,
  getJsonRpcFetchRequest,
  RPC_POLLING_INTERVAL,
} from "./useProvider";

/**
 * A runtime comprises a OtterscanConfig read from somewhere, +
 * ETH provider + status object built from the config.
 */
export type OtterscanRuntime = {
  /**
   * Config object; it is guaranteed a config has already been loaded
   * by the time the runtime object is constructed.
   */
  config: OtterscanConfig;

  /**
   * ETH provider; notice that it doesn't mean that there can't be network
   * errors, remote node shutting down, etc., situations which can make
   * this object unusable in the future and the caller should do proper
   * error handling.
   *
   * The presence of this field merely means that at the time this object
   * was instantiated, an ETH provider was built on top of the given
   * configuration, and some basic testing/probing might have been made
   * in order to fail fast obvious configuration errors.
   */
  provider: JsonRpcApiProvider;
};

/**
 * Create an OtterscanRuntime based on a previously loaded configuration.
 *
 * If the config specifies a hardcoded chain ID, just create the runtime
 * object and corresponding ethers provider.
 *
 * Otherwise, does the probing process in order to validate the connection
 * is correctly configured and reads the chain ID from the node.
 */
export const createRuntime = async (
  config: Promise<OtterscanConfig>,
): Promise<OtterscanRuntime> => {
  const effectiveConfig = await config;

  // Hardcoded config
  let provider: JsonRpcApiProvider;
  if (effectiveConfig.experimentalFixedChainId !== undefined) {
    const network = Network.from(effectiveConfig.experimentalFixedChainId);
    provider = new JsonRpcProvider(
      getJsonRpcFetchRequest(effectiveConfig.erigonURL),
      network,
      {
        staticNetwork: network,
        pollingInterval: RPC_POLLING_INTERVAL,
        ...getJsonRpcBatchOptions(effectiveConfig.rpcBatchMaxCount),
      },
    );
  } else {
    provider = await createAndProbeProvider(
      effectiveConfig.erigonURL,
      effectiveConfig.rpcBatchMaxCount,
    );
  }

  provider.disableCcipRead = !(
    effectiveConfig.externalDataSources?.ccip?.ensLookups ?? true
  );
  return {
    config: effectiveConfig,
    provider,
  };
};

/**
 * App-level context holding the runtime data. Use it only once.
 */
export const RuntimeContext = createContext<OtterscanRuntime>(null!);
