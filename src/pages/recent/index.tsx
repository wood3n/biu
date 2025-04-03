import React from "react";

import { Card, CardBody, Tab, Tabs } from "@heroui/react";

import Songs from "./songs";

const Recent = () => {
  return (
    <div className="p-4">
      <h1 className="mb-4">最近播放</h1>
      <Tabs aria-label="最近播放">
        <Tab key="songs" title="歌曲">
          <Songs />
        </Tab>
        <Tab key="albums" title="专辑">
          <Card>
            <CardBody>
              Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
              consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
              pariatur.
            </CardBody>
          </Card>
        </Tab>
        <Tab key="playlist" title="歌单">
          <Card>
            <CardBody>
              Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est
              laborum.
            </CardBody>
          </Card>
        </Tab>
        <Tab key="podcast" title="播客">
          <Card>
            <CardBody>
              Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est
              laborum.
            </CardBody>
          </Card>
        </Tab>
      </Tabs>
    </div>
  );
};

export default Recent;
