import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 15000,
      // Explorer pages can mount dozens of independent RPC queries. Refetching
      // every stale query when the window regains focus creates a request
      // burst, especially when switching between the explorer and devtools.
      refetchOnWindowFocus: false,
      // ethers already reports transport failures. A second retry layer here
      // turns a single rate-limit response into a much larger RPC burst.
      retry: false,
    },
  },
});
