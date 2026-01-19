import React from "react";

import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button } from "@heroui/react";
import { RiFileMusicLine, RiFileVideoLine, RiMore2Fill, RiPlayListAddLine } from "@remixicon/react";

interface MoreMenuProps {
  onAddToNext?: () => void;
  onDownloadAudio?: () => void;
  onDownloadVideo?: () => void;
}

const MoreMenu: React.FC<MoreMenuProps> = ({ onAddToNext, onDownloadAudio, onDownloadVideo }) => {
  return (
    <Dropdown>
      <DropdownTrigger>
        <Button variant="light" isIconOnly size="sm" radius="md" className="text-default-500">
          <RiMore2Fill size={16} />
        </Button>
      </DropdownTrigger>
      <DropdownMenu aria-label="More Actions">
        <DropdownItem key="add-next" startContent={<RiPlayListAddLine size={18} />} onPress={onAddToNext}>
          添加到下一首播放
        </DropdownItem>
        <DropdownItem key="download-audio" startContent={<RiFileMusicLine size={18} />} onPress={onDownloadAudio}>
          下载音频
        </DropdownItem>
        <DropdownItem key="download-video" startContent={<RiFileVideoLine size={18} />} onPress={onDownloadVideo}>
          下载视频
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
};

export default MoreMenu;
