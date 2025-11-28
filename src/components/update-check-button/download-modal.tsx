import { useEffect, useState } from "react";

import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Progress } from "@heroui/react";
import { filesize } from "filesize";

interface Props {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const DownloadModal = ({ isOpen, onOpenChange }: Props) => {
  const [downloadStatus, setDownloadStatus] = useState<string>();
  const [downloadProgress, setDownloadProgress] = useState<DownloadAppProgressInfo>();

  useEffect(() => {
    const removeListener = window.electron.onDownloadAppProgress(info => {
      setDownloadStatus(info.type);

      if (info.type === "progress") {
        setDownloadProgress(info.processInfo);
      }
    });

    return () => {
      removeListener();
    };
  }, []);

  return (
    <Modal
      radius="md"
      size="lg"
      isDismissable={false}
      isKeyboardDismissDisabled
      hideCloseButton
      shouldBlockScroll={false}
      isOpen={isOpen}
      onOpenChange={onOpenChange}
    >
      <ModalContent>
        <ModalHeader className="border-b border-b-zinc-200 dark:border-b-zinc-800">下载新版本更新包</ModalHeader>
        <ModalBody className="gap-0 p-4">
          <Progress
            showValueLabel
            className="w-full"
            color="primary"
            label="下载进度"
            value={downloadProgress?.percent}
          />
          <div className="mt-1 flex justify-end">
            <span>
              {downloadProgress?.bytesPerSecond ? `${filesize(downloadProgress?.bytesPerSecond)}/s` : "0 B/s"}
            </span>
            <span>
              （{downloadProgress?.transferred ? filesize(downloadProgress?.transferred) : "-"} /{" "}
              {downloadProgress?.total ? filesize(downloadProgress?.total) : "-"}）
            </span>
          </div>
        </ModalBody>
        {downloadStatus === "downloaded" && (
          <ModalFooter>
            <Button color="primary" onPress={() => window.electron.quitAndInstall()}>
              退出并安装
            </Button>
          </ModalFooter>
        )}
      </ModalContent>
    </Modal>
  );
};

export default DownloadModal;
