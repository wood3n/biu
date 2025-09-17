import React from "react";
import { Outlet } from "react-router";

import ScrollContainer from "@/components/scroll-container";
import PlayBar from "@/layout/playbar";

import Navbar from "./navbar";

const Layout = () => {
  return (
    <div className="flex h-full flex-col">
      <div className="window-drag h-16 w-full flex-none">
        <Navbar />
      </div>
      <div className="bg-content1 flex min-h-0 flex-grow">
        <ScrollContainer style={{ width: "100%" }}>
          <Outlet />
        </ScrollContainer>
      </div>
      <div className="h-23 w-full flex-none">
        <PlayBar />
      </div>
    </div>
  );
};

export default Layout;
