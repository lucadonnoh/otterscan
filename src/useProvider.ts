import {
  FetchRequest,
  JsonRpcApiProvider,
  JsonRpcProvider,
  WebSocketProvider,
} from "ethers";
import { ProbeError } from "./ProbeError";
import { MIN_API_LEVEL } from "./params";
import { ConnectionStatus } from "./types";

export const DEFAULT_ERIGON_URL = "http://127.0.0.1:8545";

export const getJsonRpcBatchOptions = (
  batchMaxCount?: number,
): { batchMaxCount?: number } => {
  if (batchMaxCount === undefined) {
    return {};
  }
  if (!Number.isInteger(batchMaxCount) || batchMaxCount < 1) {
    throw new Error("rpcBatchMaxCount must be a positive integer");
  }
  return { batchMaxCount };
};

export const getJsonRpcFetchRequest = (url?: string): FetchRequest => {
  const request = new FetchRequest(url ?? DEFAULT_ERIGON_URL);
  // A browser explorer should fail a throttled request once and let the user
  // retry through navigation. ethers otherwise retries HTTP 429 responses up
  // to its transport limit, multiplying an already overloaded request burst.
  request.retryFunc = async () => false;
  return request;
};

export const createAndProbeProvider = async (
  erigonURL?: string,
  batchMaxCount?: number,
): Promise<JsonRpcApiProvider> => {
  if (erigonURL !== undefined) {
    if (erigonURL === "") {
      console.info(`Using default erigon URL: ${DEFAULT_ERIGON_URL}`);
      erigonURL = DEFAULT_ERIGON_URL;
    } else {
      console.log(`Using configured erigon URL: ${erigonURL}`);
    }
  }

  if (erigonURL === undefined) {
    throw new ProbeError(ConnectionStatus.NOT_ETH_NODE, "");
  }

  let provider: JsonRpcApiProvider;
  if (erigonURL?.startsWith("ws://") || erigonURL?.startsWith("wss://")) {
    provider = new WebSocketProvider(erigonURL, undefined, {
      staticNetwork: true,
    });
  } else {
    // Batching takes place by default
    provider = new JsonRpcProvider(
      getJsonRpcFetchRequest(erigonURL),
      undefined,
      {
        staticNetwork: true,
        ...getJsonRpcBatchOptions(batchMaxCount),
      },
    );
  }

  // Check if it is at least a regular ETH node
  const probeBlockNumber = provider.getBlockNumber();
  const probeHeader1 = provider.send("erigon_getHeaderByNumber", ["latest"]);
  const probeOtsAPI = provider.send("ots_getApiLevel", []).then((level) => {
    if (level < MIN_API_LEVEL) {
      throw new ProbeError(ConnectionStatus.NOT_OTTERSCAN_PATCHED, erigonURL);
    }
  });
  // Wait for the `eth_chainId` call ethers internally makes so provider._network
  // is available to components
  const getNetwork = provider.getNetwork();

  try {
    await Promise.all([
      probeBlockNumber,
      probeHeader1,
      probeOtsAPI,
      getNetwork,
    ]);
    return provider;
  } catch (err) {
    // If any was rejected, then check them sequentially in order to
    // narrow the error cause, but we need to await them individually
    // because we don't know if all of them have been finished

    try {
      await probeBlockNumber;
    } catch (err) {
      console.log(err);
      throw new ProbeError(ConnectionStatus.NOT_ETH_NODE, erigonURL);
    }

    // Check if it is an Erigon node by probing a lightweight method
    try {
      // Get header for block 1
      await probeHeader1;
    } catch (err) {
      console.log(err);
      throw new ProbeError(ConnectionStatus.NOT_ERIGON, erigonURL);
    }

    // Check if it has Otterscan patches by probing a lightweight method
    try {
      await probeOtsAPI;
    } catch (err) {
      console.log(err);
      throw new ProbeError(ConnectionStatus.NOT_OTTERSCAN_PATCHED, erigonURL);
    }

    throw new Error(
      "A probe to the backend node failed, but all subsequent requests succeeded. Try refreshing the page.",
      { cause: err },
    );
  }
};
