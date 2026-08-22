import type { OtterscanConfig } from "./useConfig";

export const normalizeOtterscanConfig = (
  config: OtterscanConfig,
): OtterscanConfig => {
  const beaconAPI = config.beaconAPI?.trim();

  return {
    ...config,
    beaconAPI: beaconAPI || undefined,
  };
};
