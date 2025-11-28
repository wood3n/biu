import { addToast, Button, useDisclosure } from "@heroui/react";
import { useRequest } from "ahooks";

import { useAppUpdateStore } from "@/store/app-update";

import ReleaseNoteModal from "../release-note-modal";
import DownloadModal from "./download-modal";

/**
 * 【WIP】：手动检查更新
 */
const UpdateCheckButton = () => {
  const hasUpdate = useAppUpdateStore(s => s.hasUpdate);

  const {
    isOpen: isReleaseNoteModalOpen,
    onOpen: onReleaseNoteModalOpen,
    onOpenChange: onReleaseNoteModalOpenChange,
  } = useDisclosure();

  const {
    isOpen: isDownloadModalOpen,
    onOpen: onDownloadModalOpen,
    onOpenChange: onDownloadModalOpenChange,
  } = useDisclosure();

  const {
    data,
    loading,
    runAsync: checkUpdate,
  } = useRequest(
    async () => {
      const res = await window.electron.checkAppUpdate();

      if (res?.hasUpdate) {
        onReleaseNoteModalOpen();
      } else {
        addToast({
          title: "当前版本为最新版本",
        });
      }

      return res;
    },
    {
      manual: true,
      refreshDeps: [hasUpdate],
    },
  );

  return (
    <>
      <Button isLoading={loading} onPress={checkUpdate}>
        检查更新
      </Button>
      <ReleaseNoteModal
        isOpen={isReleaseNoteModalOpen}
        onOpenChange={onReleaseNoteModalOpenChange}
        releaseNotes={data?.releaseNotes}
        footer={
          <Button
            color="primary"
            onPress={() => {
              window.electron.downloadAppUpdate();
              onDownloadModalOpen();
            }}
          >
            下载更新
          </Button>
        }
      />
      <DownloadModal isOpen={isDownloadModalOpen} onOpenChange={onDownloadModalOpenChange} />
    </>
  );
};

export default UpdateCheckButton;
