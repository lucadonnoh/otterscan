import React, { useContext } from "react";
import { TickerContextProvider } from "../../components/AutoRefreshAge";
import { useLatestBlockHeader } from "../../useLatestBlock";
import { RuntimeContext } from "../../useRuntime";
import Blocks from "./Blocks";

const LiveBlocks: React.FC = () => {
  const { provider } = useContext(RuntimeContext);
  const block = useLatestBlockHeader(provider);
  if (!block) {
    return <div className="grow"></div>;
  }

  return (
    <TickerContextProvider>
      <Blocks latestBlock={block} />
    </TickerContextProvider>
  );
};

export default React.memo(LiveBlocks);
