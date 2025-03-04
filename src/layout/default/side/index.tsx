import React, { useState } from "react";

import { Button, Input, Tooltip } from "@heroui/react";
import { RiAddCircleLine, RiSearchLine } from "@remixicon/react";

import ScrollContainer from "@/components/scroll-container";

import { tabs } from "./tabs";

const Side = () => {
  const [tabKey, setTabKey] = useState(tabs[0].key);

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-col justify-between space-y-2 rounded-lg p-2">
        <div className="flex items-center space-x-2">
          {tabs.map(item => (
            <Button
              key={item.key}
              color={tabKey === item.key ? "success" : "default"}
              radius="full"
              className="text-sm"
              size="sm"
              startContent={item.icon}
              onPress={() => setTabKey(item.key)}
            >
              {item.title}
            </Button>
          ))}
        </div>
        <div className="flex items-center space-x-2">
          <Input size="sm" placeholder="搜索" startContent={<RiSearchLine size={14} />} />
          {tabKey === "playlist" && (
            <Tooltip content="新建歌单" closeDelay={0}>
              <Button isIconOnly size="sm" variant="flat">
                <RiAddCircleLine size={18} />
              </Button>
            </Tooltip>
          )}
        </div>
      </div>
      <ScrollContainer>
        <div className="min-h-0 flex-grow p-1">{tabs.find(item => item.key === tabKey)?.content}</div>
      </ScrollContainer>
    </div>
  );
};

export default Side;
