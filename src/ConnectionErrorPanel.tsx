import {
  faCheckCircle,
  faClock,
  faTimesCircle,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FC, PropsWithChildren, memo } from "react";
import { ConnectionStatus } from "./types";

type ConnectionErrorPanelProps = {
  connStatus: ConnectionStatus;
  nodeURL: string;
};

const ConnectionErrorPanel: FC<ConnectionErrorPanelProps> = ({
  connStatus,
  nodeURL,
}) => {
  return (
    <div className="flex h-screen flex-col bg-gray-300 font-sans">
      <div className="min-w-lg m-auto h-60 max-w-lg text-lg text-gray-700">
        <Step type="wait" msg="Trying to connect to Nethermind node..." />
        <div className="flex space-x-2">
          <span className="ml-7 text-base">{nodeURL}</span>
        </div>
        {connStatus === ConnectionStatus.NOT_ETH_NODE && (
          <Step type="error" msg="It does not seem to be an ETH node">
            <p>Make sure your browser can access the URL above.</p>
            <p>
              If you want to customize the Erigon rpcdaemon endpoint, please
              follow these{" "}
              <a
                href="https://github.com/wmitsuda/otterscan#run-otterscan-docker-image-from-docker-hub"
                target="_blank"
                rel="noreferrer noopener"
                className="font-bold text-blue-800 hover:underline"
              >
                instructions
              </a>
              .
            </p>
          </Step>
        )}
        {connStatus === ConnectionStatus.NOT_ERIGON && (
          <>
            <Step type="ok" msg="It is an ETH node" />
            <Step type="error" msg="It does not seem to support the ots_ namespace">
              Make sure the ots-proxy is running and the{" "}
              <strong>ots_</strong> namespace is available.
            </Step>
          </>
        )}
        {connStatus === ConnectionStatus.NOT_OTTERSCAN_PATCHED && (
          <>
            <Step type="ok" msg="It is an ETH node" />
            <Step
              type="error"
              msg="The ots_ API level is outdated"
            >
              Make sure the ots-proxy is up to date and the{" "}
              <strong>ots_</strong> namespace returns the expected API level.
            </Step>
          </>
        )}
      </div>
    </div>
  );
};

type StepProps = {
  type: "wait" | "ok" | "error";
  msg: string;
};

const Step: FC<PropsWithChildren<StepProps>> = memo(
  ({ type, msg, children }) => (
    <>
      <div className="flex space-x-2">
        {type === "wait" && (
          <span className="text-gray-600">
            <FontAwesomeIcon icon={faClock} size="1x" />
          </span>
        )}
        {type === "ok" && (
          <span className="text-emerald-600">
            <FontAwesomeIcon icon={faCheckCircle} size="1x" />
          </span>
        )}
        {type === "error" && (
          <span className="text-red-600">
            <FontAwesomeIcon icon={faTimesCircle} size="1x" />
          </span>
        )}
        <span>{msg}</span>
      </div>
      {children && <div className="ml-7 mt-4 text-sm">{children}</div>}
    </>
  ),
);

export default memo(ConnectionErrorPanel);
