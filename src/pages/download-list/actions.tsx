import { addToast, Tooltip, useDisclosure } from "@heroui/react";
import {
  RiDeleteBinLine,
  RiFileMusicLine,
  RiFileVideoLine,
  RiPauseLine,
  RiPlayLine,
  RiRefreshLine,
} from "@remixicon/react";

import AsyncButton from "@/components/async-button";
import ConfirmModal from "@/components/confirm-modal";

interface Props {
  data: MediaDownloadTask;
}

const DownloadActions = ({ data }: Props) => {
  const {
    isOpen: isConfirmCancelOpen,
    onOpen: onConfirmCancelOpen,
    onOpenChange: onConfirmCancelOpenChange,
  } = useDisclosure();

  const actions = [
    {
      key: "open",
      label: "打开文件",
      icon: data.outputFileType === "audio" ? <RiFileMusicLine size={18} /> : <RiFileVideoLine size={18} />,
      show: data.status === "completed",
      onPress: async () => {
        if (!data.savePath) {
          addToast({ title: "文件路径不存在", color: "danger" });
          return;
        }

        try {
          await window.electron.showFileInFolder(data.savePath);
        } catch (err) {
          addToast({ title: `${err instanceof Error ? err.message : String(err)}`, color: "danger" });
        }
      },
    },
    {
      key: "pause",
      label: "暂停",
      icon: <RiPauseLine size={18} />,
      tooltipColor: "warning" as const,
      className: "hover:text-warning",
      show: data.status === "downloading",
      onPress: async () => {
        await window.electron.pauseMediaDownloadTask(data.id);
      },
    },
    {
      key: "resume",
      label: "继续",
      icon: <RiPlayLine size={18} />,
      tooltipColor: "success" as const,
      className: "hover:text-success",
      show: ["downloadPaused", "mergePaused", "convertPaused"].includes(data.status),
      onPress: async () => {
        await window.electron.resumeMediaDownloadTask(data.id);
      },
    },
    {
      key: "retry",
      label: "重试",
      icon: <RiRefreshLine size={16} />,
      show: data.status === "failed",
      onPress: async () => {
        await window.electron.retryMediaDownloadTask(data.id);
      },
    },
    {
      key: "delete",
      label: "删除",
      icon: <RiDeleteBinLine size={16} />,
      show: true,
      tooltipColor: "danger" as const,
      className: "hover:text-danger",
      onPress: async () => {
        if (
          ["downloading", "downloadPaused", "merging", "mergePaused", "converting", "convertPaused"].includes(
            data.status,
          )
        ) {
          onConfirmCancelOpen();
          return;
        }

        await window.electron.cancelMediaDownloadTask(data.id);
      },
    },
  ];

  return (
    <>
      <div className="flex items-center justify-center space-x-1">
        {actions
          .filter(item => item.show)
          .map(item => (
            <Tooltip closeDelay={0} disableAnimation key={item.key} content={item.label} color={item.tooltipColor}>
              <AsyncButton
                key={item.key}
                variant="light"
                size="sm"
                isIconOnly
                onPress={item.onPress}
                className={item.className}
              >
                {item.icon}
              </AsyncButton>
            </Tooltip>
          ))}
      </div>
      <ConfirmModal
        isOpen={isConfirmCancelOpen}
        onOpenChange={onConfirmCancelOpenChange}
        title="确认删除吗？"
        description="当前任务未下载完成，确认删除后将无法恢复"
        confirmText="删除"
        onConfirm={async () => {
          await window.electron.cancelMediaDownloadTask(data.id);
          return true;
        }}
      />
    </>
  );
};

export default DownloadActions;
