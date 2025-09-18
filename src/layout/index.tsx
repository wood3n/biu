import React from "react";
import { Outlet } from "react-router";

import { Card } from "@heroui/react";

import PlayBar from "@/layout/playbar";

import Navbar from "./navbar";
import SideNav from "./side";

const Layout = () => {
  return (
    <div className="flex h-full flex-col">
      <div className="window-drag h-16 w-full flex-none">
        <Navbar />
      </div>
      <div className="flex min-h-0 flex-grow space-x-2 px-2">
        <SideNav />
        <Card className="h-full flex-grow">
          <Outlet />
        </Card>
      </div>
      <div className="h-22 w-full flex-none">
        <PlayBar />
      </div>
    </div>
  );
};

export default Layout;
