import { Dropdown, DropdownTrigger, Button, DropdownMenu, DropdownItem, Switch } from "@heroui/react";
import { RiSettings3Line } from "@remixicon/react";

import { usePlayList } from "@/store/play-list";

const Settings = () => {
  const shouldKeepPagesOrderInRandomPlayMode = usePlayList(s => s.shouldKeepPagesOrderInRandomPlayMode);
  const setShouldKeepPagesOrderInRandomPlayMode = usePlayList(s => s.setShouldKeepPagesOrderInRandomPlayMode);

  return (
    <Dropdown>
      <DropdownTrigger>
        <Button isIconOnly size="sm" variant="light" className="window-no-drag">
          <RiSettings3Line size={16} />
        </Button>
      </DropdownTrigger>
      <DropdownMenu aria-label="播放列表设置">
        <DropdownItem key="shouldKeepPagesOrderInRandomPlayMode">
          <Switch
            size="sm"
            isSelected={shouldKeepPagesOrderInRandomPlayMode}
            onValueChange={setShouldKeepPagesOrderInRandomPlayMode}
          >
            随机播放时保持分集顺序
          </Switch>
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
};

export default Settings;
