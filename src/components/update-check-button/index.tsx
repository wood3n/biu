import { addToast } from "@heroui/react";

import { useAppUpdateStore } from "@/store/app-update";
import { useModalStore } from "@/store/modal";

import AsyncButton from "../async-button";

const UpdateCheckButton = () => {
  const isUpdateAvailable = useAppUpdateStore(s => s.isUpdateAvailable);
  const onOpenReleaseNoteModal = useModalStore(s => s.onOpenReleaseNoteModal);

  const checkUpdate = async () => {
    if (isUpdateAvailable) {
      onOpenReleaseNoteModal();

      return;
    }

    const res = await window.electron.checkAppUpdate();

    if (res?.error) {
      addToast({
        title: "检查更新失败",
        description: res.error,
        color: "danger",
      });
    } else if (res?.isUpdateAvailable) {
      onOpenReleaseNoteModal();
    } else {
      addToast({
        title: "当前版本为最新版本",
      });
    }
  };

  return <AsyncButton onPress={checkUpdate}>{isUpdateAvailable ? "查看更新内容" : "检查更新"}</AsyncButton>;
};

export default UpdateCheckButton;
