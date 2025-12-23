import { useEffect, useRef, useState } from "react";

import { addToast, Tooltip } from "@heroui/react";
import {
  RiDeleteBinLine,
  RiFileMusicLine,
  RiFileVideoLine,
  RiPauseLine,
  RiPlayLine,
  RiRefreshLine,
} from "@remixicon/react";

import AsyncButton from "@/components/async-button";
import { useModalStore } from "@/store/modal";

interface Props {
  data: MediaDownloadTask;
}

type ActionKey = "open" | "pause" | "resume" | "retry" | "delete";

const DownloadActions = ({ data }: Props) => {
  const onOpenConfirmModal = useModalStore(s => s.onOpenConfirmModal);

  const [pendingAction, setPendingAction] = useState<ActionKey | null>(null);
  const pendingTimeoutRef = useRef<number | null>(null);

  const clearPendingTimeout = () => {
    if (pendingTimeoutRef.current) {
      window.clearTimeout(pendingTimeoutRef.current);
      pendingTimeoutRef.current = null;
    }
  };

  const lockAction = (key: ActionKey) => {
    setPendingAction(key);
    clearPendingTimeout();
    pendingTimeoutRef.current = window.setTimeout(() => {
      setPendingAction(null);
      pendingTimeoutRef.current = null;
    }, 2000);
  };

  useEffect(() => {
    if (!pendingAction) {
      clearPendingTimeout();
      return;
    }

    if (pendingAction === "pause" && data.status !== "downloading") {
      setPendingAction(null);
      return;
    }

    if (pendingAction === "resume" && !["downloadPaused", "mergePaused", "convertPaused"].includes(data.status)) {
      setPendingAction(null);
      return;
    }

    if (pendingAction === "retry" && data.status !== "failed") {
      setPendingAction(null);
    }
  }, [data.status, pendingAction]);

  useEffect(() => {
    return () => {
      clearPendingTimeout();
    };
  }, []);

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
        if (pendingAction) return;
        lockAction("pause");
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
        if (pendingAction) return;
        lockAction("resume");
        await window.electron.resumeMediaDownloadTask(data.id);
      },
    },
    {
      key: "retry",
      label: "重试",
      icon: <RiRefreshLine size={16} />,
      show: data.status === "failed",
      onPress: async () => {
        if (pendingAction) return;
        lockAction("retry");
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
        if (pendingAction) return;

        if (
          ["downloading", "downloadPaused", "merging", "mergePaused", "converting", "convertPaused"].includes(
            data.status,
          )
        ) {
          onOpenConfirmModal({
            title: "确认删除吗？",
            description: "当前任务未下载完成，确认删除后将无法恢复",
            confirmText: "删除",
            onConfirm: async () => {
              if (pendingAction) return false;
              lockAction("delete");
              await window.electron.cancelMediaDownloadTask(data.id);
              return true;
            },
          });
          return;
        }

        lockAction("delete");
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
                isLoading={pendingAction === item.key}
                isDisabled={Boolean(pendingAction) && pendingAction !== item.key}
                onPress={item.onPress}
                className={item.className}
              >
                {item.icon}
              </AsyncButton>
            </Tooltip>
          ))}
      </div>
    </>
  );
};

export default DownloadActions;
