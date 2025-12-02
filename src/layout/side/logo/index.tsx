import { Badge, Button, Tooltip, useDisclosure } from "@heroui/react";
import { RiLogoutBoxLine } from "@remixicon/react";
import { twMerge } from "tailwind-merge";

import { ReactComponent as LogoIcon } from "@/assets/icons/logo.svg";
import ReleaseNoteModal from "@/components/release-note-modal";
import { useAppUpdateStore } from "@/store/app-update";

const isMac = window.electron?.getPlatform() === "macos";

const Logo = () => {
  const hasUpdate = useAppUpdateStore(s => s.hasUpdate);
  const releaseNotes = useAppUpdateStore(s => s.releaseNotes);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  return (
    <>
      <div
        className={twMerge(
          "window-drag text-primary flex flex-none items-center space-x-1 px-7 py-4",
          isMac && "pt-12",
        )}
      >
        <LogoIcon className="h-10 w-10" />
        {hasUpdate ? (
          <Badge
            color="danger"
            content="new"
            size="sm"
            classNames={{
              base: "window-no-drag cursor-pointer",
              badge: "-right-1/5",
            }}
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
      <ReleaseNoteModal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        releaseNotes={releaseNotes}
        footer={
          <Button color="primary" startContent={<RiLogoutBoxLine size={18} />} onPress={window.electron.quitAndInstall}>
            退出并安装
          </Button>
        }
      />
    </>
  );
};

export default Logo;
