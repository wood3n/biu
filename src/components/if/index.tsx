import React from "react";

interface Props {
  condition: unknown;
  children: React.ReactNode;
}

const If = ({ condition, children }: Props) => {
  return <>{Boolean(condition) && children}</>;
};

export default If;
