import { afterEach, describe, expect, jest, test } from "@jest/globals";
import { fetchFourBytesSignature } from "./use4Bytes";

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

describe("fetchFourBytesSignature", () => {
  test("treats a missing signature response as an expected miss", async () => {
    const text = jest.fn<() => Promise<string>>();
    const fetchMock = jest.fn<typeof fetch>().mockResolvedValue({
      ok: true,
      status: 204,
      text,
    } as unknown as Response);
    globalThis.fetch = fetchMock;

    await expect(fetchFourBytesSignature("", "0xea9384fa")).resolves.toBeNull();
    expect(fetchMock).toHaveBeenCalledWith("/signatures/ea9384fa");
    expect(text).not.toHaveBeenCalled();
  });

  test("parses the first valid signature", async () => {
    const fetchMock = jest.fn<typeof fetch>().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => "transfer(address,uint256);transfer(address,uint)",
    } as Response);
    globalThis.fetch = fetchMock;

    await expect(fetchFourBytesSignature("", "0xa9059cbb")).resolves.toEqual({
      name: "transfer",
      signature: "transfer(address,uint256)",
      fromVerifiedContract: false,
    });
  });
});
