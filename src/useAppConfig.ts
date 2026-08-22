import { createContext, useContext } from "react";
import type { SourcifySourceName } from "./sourcify/useSourcify";

export type AppConfig = {
  sourcifySource: SourcifySourceName | null;
  setSourcifySource: (newSourcifySource: SourcifySourceName) => void;
};

export const AppConfigContext = createContext<AppConfig>(undefined!);

export const useAppConfigContext = () => {
  return useContext(AppConfigContext);
};
