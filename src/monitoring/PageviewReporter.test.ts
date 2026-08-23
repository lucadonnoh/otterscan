import {
  classifyPageviewRoute,
  normalizePageviewEndpoint,
} from "./PageviewReporter";

describe("classifyPageviewRoute", () => {
  it.each([
    ["/", "home"],
    ["/search?q=alice.gwei", "search"],
    ["/special/liveBlocks", "live-blocks"],
    ["/block/123", "block"],
    ["/block/123/txs", "block"],
    ["/block/123/tx/4", "transaction"],
    ["/tx/0xdeadbeef", "transaction"],
    ["/address/0x1234", "address"],
    ["/address/0x1234/tokens", "address"],
    ["/address/0x1234/contract", "contract"],
    ["/address/0x1234/readContractAsProxy", "contract"],
    ["/contracts/erc20", "contracts"],
    ["/epoch/1", "epoch"],
    ["/slot/1", "slot"],
    ["/slotByBlockRoot/0x1234", "slot"],
    ["/validator/1", "validator"],
    ["/faucets", "faucets"],
    ["/broadcastTx", "broadcast"],
    ["/unknown/path", "other"],
  ])("maps %s to %s", (pathname, expected) => {
    expect(classifyPageviewRoute(pathname)).toBe(expected);
  });
});

describe("normalizePageviewEndpoint", () => {
  it("accepts only relative same-origin paths", () => {
    expect(normalizePageviewEndpoint(" /__ops/pageview/ ")).toBe(
      "/__ops/pageview",
    );
    expect(normalizePageviewEndpoint("https://analytics.example/view")).toBe(
      undefined,
    );
    expect(normalizePageviewEndpoint("//analytics.example/view")).toBe(
      undefined,
    );
    expect(normalizePageviewEndpoint("/__ops/pageview?secret=1")).toBe(
      undefined,
    );
  });
});
