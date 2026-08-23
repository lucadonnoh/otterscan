import { useEffect } from "react";
import { useLocation } from "react-router";

export const PAGEVIEW_ROUTES = [
  "home",
  "search",
  "live-blocks",
  "block",
  "transaction",
  "address",
  "contract",
  "contracts",
  "token",
  "epoch",
  "slot",
  "validator",
  "faucets",
  "broadcast",
  "other",
] as const;

export type PageviewRoute = (typeof PAGEVIEW_ROUTES)[number];

const CONTRACT_TABS = new Set([
  "contract",
  "readcontract",
  "proxylogiccontract",
  "readcontractasproxy",
]);

export const classifyPageviewRoute = (pathname: string): PageviewRoute => {
  const path = pathname.split(/[?#]/, 1)[0];
  const parts = path
    .split("/")
    .filter(Boolean)
    .map((part) => part.toLowerCase());

  if (parts.length === 0) {
    return "home";
  }
  if (parts[0] === "search") {
    return "search";
  }
  if (parts[0] === "special" && parts[1] === "liveblocks") {
    return "live-blocks";
  }
  if (parts[0] === "block" && parts[2] === "tx") {
    return "transaction";
  }
  if (parts[0] === "block") {
    return "block";
  }
  if (parts[0] === "tx") {
    return "transaction";
  }
  if (parts[0] === "address") {
    return parts[2] !== undefined && CONTRACT_TABS.has(parts[2])
      ? "contract"
      : "address";
  }
  if (parts[0] === "contracts") {
    return "contracts";
  }
  if (parts[0] === "token") {
    return "token";
  }
  if (parts[0] === "epoch") {
    return "epoch";
  }
  if (parts[0] === "slot" || parts[0] === "slotbyblockroot") {
    return "slot";
  }
  if (parts[0] === "validator") {
    return "validator";
  }
  if (parts[0] === "faucets") {
    return "faucets";
  }
  if (parts[0] === "broadcasttx") {
    return "broadcast";
  }
  return "other";
};

export const normalizePageviewEndpoint = (
  endpoint: string | undefined,
): string | undefined => {
  const value = endpoint?.trim().replace(/\/+$/, "");
  if (
    !value ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("?") ||
    value.includes("#")
  ) {
    return undefined;
  }
  return value;
};

const reportPageview = (endpoint: string, pathname: string): void => {
  const url = `${endpoint}/${classifyPageviewRoute(pathname)}`;
  try {
    if (
      typeof navigator.sendBeacon === "function" &&
      navigator.sendBeacon(url)
    ) {
      return;
    }
    void fetch(url, {
      method: "POST",
      cache: "no-store",
      credentials: "omit",
      keepalive: true,
    }).catch(() => undefined);
  } catch {
    // Monitoring must never interfere with explorer navigation.
  }
};

type PageviewReporterProps = {
  endpoint?: string;
};

const PageviewReporter = ({ endpoint }: PageviewReporterProps) => {
  const location = useLocation();
  const normalizedEndpoint = normalizePageviewEndpoint(endpoint);

  useEffect(() => {
    if (normalizedEndpoint !== undefined) {
      reportPageview(normalizedEndpoint, location.pathname);
    }
  }, [location.key, location.pathname, normalizedEndpoint]);

  return null;
};

export default PageviewReporter;
