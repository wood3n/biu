import React, { useState } from "react";

import { Button, Tab, Tabs, Tooltip } from "@heroui/react";
import { RiAddCircleLine } from "@remixicon/react";

import { tabs } from "./tabs";

const Side = () => {
  const [tabKey, setTabKey] = useState(tabs[0].key);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between p-2 pb-0">
        <Tabs aria-label="侧边导航" variant="underlined" color="success" selectedKey={tabKey} onSelectionChange={key => setTabKey(key as string)}>
          {tabs.map(item => (
            <Tab
              key={item.key}
              title={
                <div className="flex items-center space-x-1">
                  {item.icon}
                  <span>{item.title}</span>
                </div>
              }
            />
          ))}
        </Tabs>
        {tabKey === "playlist" && (
          <Tooltip content="新建歌单">
            <Button isIconOnly size="sm" variant="light">
              <RiAddCircleLine size={18} />
            </Button>
          </Tooltip>
        )}
      </div>
      <div className="min-h-0 flex-grow p-1">{tabs.find(item => item.key === tabKey)?.content}</div>
    </div>
  );
};

export default Side;
