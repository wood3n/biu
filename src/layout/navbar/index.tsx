import { useEffect } from "react";

import { Button } from "@heroui/react";
import { RiPictureInPicture2Line } from "@remixicon/react";
import clx from "classnames";

import { useAppUpdateStore } from "@/store/app-update";

import Navigation from "./navigation";
import Search from "./search";
import UpdateNotify from "./update-notify";
import UserCard from "./user";

const platform = window.electron.getPlatform();

const LayoutNavbar = () => {
  const hasUpdate = useAppUpdateStore(s => s.hasUpdate);
  const setUpdate = useAppUpdateStore(s => s.setUpdate);

  useEffect(() => {
    const removeListener = window.electron.onDownloadAppProgress(info => {
      if (info.type === "downloaded" && info.releaseInfo) {
        setUpdate({
          hasUpdate: true,
          isDownloaded: true,
          latestVersion: info.releaseInfo.latestVersion,
          releaseNotes: info.releaseInfo.releaseNotes,
        });
      }
    });

    return () => {
      removeListener();
    };
  }, []);

  const handleSwitchToMini = () => {
    window.electron.switchToMiniPlayer();
  };

  return (
    <div className="window-drag flex h-full items-center justify-between px-4">
      <div className="flex items-center justify-start space-x-2">
        <Navigation />
        <Search />
      </div>
      <div
        className={clx("window-no-drag flex items-center justify-center space-x-4", {
          "pr-[140px]": platform === "windows" || platform === "linux",
        })}
      >
        {hasUpdate && <UpdateNotify />}
        <Button isIconOnly size="sm" variant="light" onPress={handleSwitchToMini}>
          <RiPictureInPicture2Line size={18} />
        </Button>
        <UserCard />
      </div>
    </div>
  );
};

export default LayoutNavbar;
