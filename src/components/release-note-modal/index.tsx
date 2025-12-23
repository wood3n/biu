import { useEffect, useState } from "react";

import { addToast, Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Progress } from "@heroui/react";
import { RiInformationLine } from "@remixicon/react";
import { filesize } from "filesize";
import { useShallow } from "zustand/react/shallow";

import { useAppUpdateStore } from "@/store/app-update";
import { useModalStore } from "@/store/modal";

import Typography from "../typography";

const ReleaseNoteModal = () => {
  const { isReleaseNoteModalOpen, onReleaseNoteModalOpenChange } = useModalStore(
    useShallow(state => ({
      isReleaseNoteModalOpen: state.isReleaseNoteModalOpen,
      onReleaseNoteModalOpenChange: state.onReleaseNoteModalOpenChange,
    })),
  );
  const releaseNotes = useAppUpdateStore(state => state.releaseNotes);
  const [status, setStatus] = useState<DownloadAppUpdateStatus>();
  const [downloadProgress, setDownloadProgress] = useState<DownloadAppProgressInfo>();
  const [downloadInfo, setDownloadInfo] = useState<DownloadInfo>();
  const [error, setError] = useState<string>();

  const startDownload = async () => {
    setStatus("downloading");
    try {
      await window.electron.downloadAppUpdate();
    } catch (e) {
      setStatus("error");
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  const handleOpenInstaller = async () => {
    try {
      if (downloadInfo?.filePath) {
        const ok = await window.electron.showFileInFolder(downloadInfo.filePath);
        if (!ok) {
          addToast({
            title: "无法打开安装包文件夹",
            color: "danger",
          });
        }
        return ok;
      }
    } catch (e) {
      addToast({
        title: e instanceof Error ? e.message : String(e),
        color: "danger",
      });
    }
  };

  useEffect(() => {
    const removeListener = window.electron.onDownloadAppProgress(info => {
      setStatus(info.status);
      switch (info.status) {
        case "downloading":
          setDownloadProgress(info.processInfo);
          break;
        case "downloaded":
          setDownloadInfo(info.downloadInfo);
          break;
        case "error":
          setError(info.error);
          break;
      }
    });

    return () => {
      removeListener();
    };
  }, []);

  return (
    <>
      <Modal
        radius="md"
        shouldBlockScroll={false}
        scrollBehavior="inside"
        size="lg"
        isOpen={isReleaseNoteModalOpen}
        onOpenChange={onReleaseNoteModalOpenChange}
        isKeyboardDismissDisabled
        isDismissable={false}
        disableAnimation
      >
        <ModalContent>
          <ModalHeader>✨ 有新版本更新</ModalHeader>
          <ModalBody className="px-0">
            {releaseNotes?.trim() ? (
              <Typography content={releaseNotes} />
            ) : (
              <div className="text-center text-sm text-zinc-500 dark:text-zinc-400">暂无更新日志</div>
            )}
          </ModalBody>
          {status === "downloading" && Boolean(downloadProgress?.percent) && (
            <Progress radius="none" className="w-full" color="primary" value={downloadProgress?.percent} />
          )}
          <ModalFooter className="items-center justify-between">
            <div className="min-w-0 flex-auto">
              {status === "downloading" && (
                <div className="items-center">{filesize(downloadProgress?.bytesPerSecond || 0)}/s</div>
              )}
              {status === "error" && <span className="text-danger block truncate">{error}</span>}
            </div>
            {status === "downloaded" ? (
              <div className="inline-flex items-center space-x-2">
                <span className="inline-flex items-center space-x-1">
                  <RiInformationLine size={16} />
                  <span className="text-sm text-zinc-500 dark:text-zinc-400">安装包已下载完成</span>
                </span>
                {window.electron.isSupportAutoUpdate() ? (
                  <Button color="primary" onPress={window.electron.quitAndInstall}>
                    退出并安装更新
                  </Button>
                ) : (
                  <Button color="primary" onPress={handleOpenInstaller}>
                    打开安装包文件夹
                  </Button>
                )}
              </div>
            ) : (
              <div className="inline-flex items-center space-x-2">
                {Boolean(downloadProgress) && (
                  <span>
                    {downloadProgress?.transferred ? filesize(downloadProgress.transferred) : "-"}/
                    {downloadProgress?.total ? filesize(downloadProgress.total) : "-"}
                  </span>
                )}

                <Button
                  color="primary"
                  isLoading={status === "downloading"}
                  onPress={startDownload}
                  startContent={
                    Boolean(downloadProgress?.percent) && <span>{downloadProgress?.percent.toFixed(2)}%</span>
                  }
                >
                  {status === "downloading" ? "正在下载" : "下载更新"}
                </Button>
              </div>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ReleaseNoteModal;
