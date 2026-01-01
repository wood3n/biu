import { useState } from "react";

import { Tooltip, Button, Badge, useDisclosure } from "@heroui/react";
import { RiTeamLine } from "@remixicon/react";
import { useRequest } from "ahooks";

import DynamicFeedDrawer from "@/components/dynamic-feed-drawer";
import { getWebDynamicFeedAllUpdate } from "@/service/web-dynamic";

const UserFeed = () => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [updateCount, setUpdateCount] = useState(0);

  useRequest(
    async () => {
      const res = await getWebDynamicFeedAllUpdate({
        type: "video",
        update_baseline: 0,
        web_location: "333.1365",
      });
      return res;
    },
    {
      pollingInterval: 300000,
      pollingWhenHidden: false,
      onSuccess: res => {
        if (res.code === 0) {
          setUpdateCount(res.data?.update_num ?? 0);
        }
      },
      onError: () => {
        setUpdateCount(0);
      },
    },
  );

  const handleOpen = () => {
    setUpdateCount(0);
    onOpen();
  };

  return (
    <>
      <Tooltip closeDelay={0} content="动态">
        {updateCount > 0 ? (
          <Badge
            color="danger"
            shape="circle"
            content={updateCount > 99 ? "99+" : updateCount}
            size="sm"
            variant="solid"
          >
            <Button isIconOnly size="sm" variant="light" onPress={handleOpen}>
              <RiTeamLine size={20} />
            </Button>
          </Badge>
        ) : (
          <Button isIconOnly size="sm" variant="light" onPress={handleOpen}>
            <RiTeamLine size={20} />
          </Button>
        )}
      </Tooltip>
      <DynamicFeedDrawer isOpen={isOpen} onOpenChange={onOpenChange} />
    </>
  );
};

export default UserFeed;
