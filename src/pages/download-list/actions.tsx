import { addToast, Button, Tooltip } from "@heroui/react";
import {
  RiDeleteBinLine,
  RiFileMusicLine,
  RiFileVideoLine,
  RiPauseLine,
  RiPlayLine,
  RiRefreshLine,
} from "@remixicon/react";

interface Props {
  data: MediaDownloadTask;
}

const DownloadActions = ({ data }: Props) => {
  const actions = [
    {
      key: "open",
      label: "打开文件",
      color: "primary" as const,
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
      show: data.status === "downloading",
      onPress: async () => {
        await window.electron.pauseMediaDownloadTask(data.id);
      },
    },
    {
      key: "resume",
      label: "继续",
      icon: <RiPlayLine size={18} />,
      show: ["downloadPaused", "mergePaused", "convertPaused"].includes(data.status),
      onPress: async () => {
        await window.electron.resumeMediaDownloadTask(data.id);
      },
    },
    {
      key: "retry",
      label: "重试",
      icon: <RiRefreshLine size={18} />,
      show: data.status === "failed",
      onPress: async () => {
        await window.electron.retryMediaDownloadTask(data.id);
      },
    },
    {
      key: "delete",
      label: "删除",
      icon: <RiDeleteBinLine size={18} />,
      color: "danger" as const,
      show: true,
      onPress: async () => {
        await window.electron.cancelMediaDownloadTask(data.id);
      },
    },
  ];

  return (
    <div className="flex items-center justify-center">
      {actions
        .filter(item => item.show)
        .map(item => (
          <Tooltip key={item.key} content={item.label}>
            <Button key={item.key} variant="light" color={item.color} size="sm" isIconOnly onPress={item.onPress}>
              {item.icon}
            </Button>
          </Tooltip>
        ))}
    </div>
  );
};

export default DownloadActions;
