import { describe, expect, test } from "@jest/globals";
import { queryClient } from "./queryClient";

describe("queryClient RPC request behavior", () => {
  test("does not refetch every query on focus or retry failures", () => {
    const options = queryClient.getDefaultOptions().queries;

    expect(options?.refetchOnWindowFocus).toBe(false);
    expect(options?.retry).toBe(false);
  });
});
