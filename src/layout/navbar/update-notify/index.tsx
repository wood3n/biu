import { Button, Chip, useDisclosure } from "@heroui/react";
import { RiLogoutBoxLine } from "@remixicon/react";

import ReleaseNoteModal from "@/components/release-note-modal";
import { useAppUpdateStore } from "@/store/app-update";

const UpdateNotify = () => {
  const releaseNotes = useAppUpdateStore(s => s.releaseNotes);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  return (
    <>
      <Chip variant="dot" size="lg" color="success" className="cursor-pointer" onClick={onOpen}>
        新版本可用
      </Chip>
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

export default UpdateNotify;
