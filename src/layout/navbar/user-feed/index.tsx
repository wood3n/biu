import { Tooltip, Button, useDisclosure } from "@heroui/react";
import { RiTeamLine } from "@remixicon/react";

import DynamicFeedDrawer from "@/components/dynamic-feed";

const UserFeed = () => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  return (
    <>
      <Tooltip closeDelay={0} content="动态">
        <Button isIconOnly size="sm" variant="light" onPress={onOpen}>
          <RiTeamLine size={20} />
        </Button>
      </Tooltip>
      <DynamicFeedDrawer isOpen={isOpen} onOpenChange={onOpenChange} />
    </>
  );
};

export default UserFeed;
