import { addToast, useDisclosure } from "@heroui/react";

import { useAppUpdateStore } from "@/store/app-update";

import AsyncButton from "../async-button";
import ReleaseNoteModal from "../release-note-modal";

const UpdateCheckButton = () => {
  const isUpdateAvailable = useAppUpdateStore(s => s.isUpdateAvailable);

  const {
    isOpen: isReleaseNoteModalOpen,
    onOpen: onReleaseNoteModalOpen,
    onOpenChange: onReleaseNoteModalOpenChange,
  } = useDisclosure();

  const checkUpdate = async () => {
    if (isUpdateAvailable) {
      return Promise.resolve();
    }

    const res = await window.electron.checkAppUpdate();

    if (res?.error) {
      addToast({
        title: "检查更新失败",
        description: res.error,
        color: "danger",
      });
    } else if (res?.isUpdateAvailable) {
      onReleaseNoteModalOpen();
    } else {
      addToast({
        title: "当前版本为最新版本",
      });
    }
  };

  return (
    <>
      <AsyncButton onPress={checkUpdate}>{isUpdateAvailable ? "查看更新内容" : "检查更新"}</AsyncButton>
      <ReleaseNoteModal isOpen={isReleaseNoteModalOpen} onOpenChange={onReleaseNoteModalOpenChange} />
    </>
  );
};

export default UpdateCheckButton;
