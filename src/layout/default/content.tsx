import React from "react";
import { Outlet } from "react-router-dom";

import clx from "classnames";
import { Card, CardBody } from "@heroui/react";

import Side from "./side";

interface Props {
  className?: string;
}

const Content = ({ className }: Props) => {
  return (
    <div className={clx("flex space-x-2 p-2", className)}>
      <Card className="w-1/5 min-w-64">
        <CardBody className="p-0">
          <Side />
        </CardBody>
      </Card>
      <Card className="flex-grow">
        <CardBody className="p-0">
          <Outlet />
        </CardBody>
      </Card>
    </div>
  );
};

export default Content;
