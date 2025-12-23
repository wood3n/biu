import { useEffect, useState } from "react";

import { Badge, Tooltip } from "@heroui/react";
import { twMerge } from "tailwind-merge";

import { ReactComponent as LogoIcon } from "@/assets/icons/logo.svg";
import { useAppUpdateStore } from "@/store/app-update";
import { useModalStore } from "@/store/modal";

const isMac = window.electron?.getPlatform() === "macos";

const Logo = () => {
  const onOpenReleaseNoteModal = useModalStore(s => s.onOpenReleaseNoteModal);
  const isUpdateAvailable = useAppUpdateStore(s => s.isUpdateAvailable);
  const [isFullScreen, setIsFullScreen] = useState(false);

  useEffect(() => {
    if (!isMac) return;

    window.electron?.isFullScreen().then(setIsFullScreen);
    const unlisten = window.electron?.onWindowFullScreenChange(setIsFullScreen);

    return () => {
      unlisten?.();
    };
  }, []);

  return (
    <>
      <div
        className={twMerge(
          "window-drag text-primary flex flex-none items-center space-x-1 px-7 py-4",
          isMac && !isFullScreen && "pt-12",
        )}
      >
        <LogoIcon className="h-10 w-10" />
        {isUpdateAvailable ? (
          <Badge
            color="danger"
            content="new"
            size="sm"
            classNames={{
              badge: "window-no-drag cursor-pointer -right-1/5",
            }}
            onClick={onOpenReleaseNoteModal}
          >
            <Tooltip title="新版本更新">
              <div
                className="window-no-drag cursor-pointer text-2xl leading-none font-bold"
                onClick={onOpenReleaseNoteModal}
              >
                Biu
              </div>
            </Tooltip>
          </Badge>
        ) : (
          <span className="text-2xl leading-none font-bold">Biu</span>
        )}
      </div>
    </>
  );
};

export default Logo;
