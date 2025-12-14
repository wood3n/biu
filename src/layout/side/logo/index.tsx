import { Badge, Tooltip, useDisclosure } from "@heroui/react";
import { twMerge } from "tailwind-merge";

import { ReactComponent as LogoIcon } from "@/assets/icons/logo.svg";
import ReleaseNoteModal from "@/components/release-note-modal";
import { useAppUpdateStore } from "@/store/app-update";
import { tauriAdapter } from "@/utils/tauri-adapter";

const isMac = tauriAdapter?.getPlatform() === "macos";

const Logo = () => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const isUpdateAvailable = useAppUpdateStore(s => s.isUpdateAvailable);

  return (
    <>
      <div
        className={twMerge(
          "window-drag text-primary flex flex-none items-center space-x-1 px-7 py-4",
          isMac && "pt-12",
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
            onClick={onOpen}
          >
            <Tooltip title="新版本更新">
              <div className="window-no-drag cursor-pointer text-2xl leading-none font-bold" onClick={onOpen}>
                Biu
              </div>
            </Tooltip>
          </Badge>
        ) : (
          <span className="text-2xl leading-none font-bold">Biu</span>
        )}
      </div>
      <ReleaseNoteModal isOpen={isOpen} onOpenChange={onOpenChange} />
    </>
  );
};

export default Logo;
