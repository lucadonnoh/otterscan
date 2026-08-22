import { FC } from "react";
import { NavLink } from "react-router";
import { ResolvedAddressRenderer } from "../../../api/address-resolver/address-resolver";
import GNSLogo from "./gnsLogo.svg";

type GNSNameProps = {
  name: string;
  address: string;
  linkable: boolean;
  dontOverrideColors?: boolean;
};

const GNSName: FC<GNSNameProps> = ({
  name,
  address,
  linkable,
  dontOverrideColors,
}) => {
  if (linkable) {
    return (
      <NavLink
        className={`inline-flex items-baseline space-x-1 font-sans ${
          dontOverrideColors ? "" : "text-link-blue hover:text-link-blue-hover"
        } truncate`}
        to={`/address/${name}`}
        title={`${name}: ${address}`}
      >
        <Content linkable name={name} />
      </NavLink>
    );
  }

  return (
    <span
      className="inline-flex items-baseline space-x-1 truncate font-sans text-gray-700"
      title={`${name}: ${address}`}
    >
      <Content linkable={false} name={name} />
    </span>
  );
};

type ContentProps = {
  linkable: boolean;
  name: string;
};

const Content: FC<ContentProps> = ({ linkable, name }) => (
  <>
    <img
      className={`self-center ${linkable ? "" : "grayscale"}`}
      src={GNSLogo}
      alt="GNS Logo"
      width={12}
      height={12}
    />
    <span className="truncate">{name}</span>
  </>
);

export const gnsRenderer: ResolvedAddressRenderer<string> = (
  chainId,
  address,
  resolvedAddress,
  linkable,
  dontOverrideColors,
) => (
  <GNSName
    address={address}
    name={resolvedAddress}
    linkable={linkable}
    dontOverrideColors={dontOverrideColors}
  />
);

export default GNSName;
