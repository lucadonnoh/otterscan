import { afterEach, describe, expect, jest, test } from "@jest/globals";
import { fetchSourcifyMetadata, SourcifySourceMap } from "./useSourcify";

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

describe("fetchSourcifyMetadata", () => {
  test("treats the same-origin proxy's 204 as an expected miss", async () => {
    const json = jest.fn<() => Promise<unknown>>();
    const fetchMock = jest.fn<typeof fetch>().mockResolvedValue({
      ok: true,
      status: 204,
      json,
    } as unknown as Response);
    globalThis.fetch = fetchMock;

    const sources: SourcifySourceMap = {
      Sourcify: {
        url: "/sourcify",
        backendFormat: "SourcifyAPIV2",
      },
    };

    await expect(
      fetchSourcifyMetadata(
        sources,
        "Sourcify",
        "0x9D51D507BC7264d4fE8Ad1cf7Fe191933A0a81d6",
        1n,
        false,
      ),
    ).resolves.toBeNull();
    expect(fetchMock).toHaveBeenCalledWith(
      "/sourcify/v2/contract/1/0x9D51D507BC7264d4fE8Ad1cf7Fe191933A0a81d6?fields=metadata",
    );
    expect(json).not.toHaveBeenCalled();
  });
});
