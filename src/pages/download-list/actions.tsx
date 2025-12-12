import { Button, Tooltip } from "@heroui/react";
import { RiDeleteBinLine, RiPauseLine, RiPlayLine, RiRefreshLine } from "@remixicon/react";

interface Props {
  data: MediaDownloadTask;
}

const DownloadActions = ({ data }: Props) => {
  const actions = [
    {
      key: "pause",
      label: "暂停",
      icon: <RiPauseLine size={18} />,
      show: ["downloading", "merging", "converting"].includes(data.status),
      onPress: async () => {
        await window.electron.pauseMediaDownloadTask(data.id);
      },
    },
    {
      key: "resume",
      label: "继续",
      icon: <RiPlayLine size={18} />,
      show: ["paused"].includes(data.status),
      onPress: async () => {
        await window.electron.resumeMediaDownloadTask(data.id);
      },
    },
    {
      key: "retry",
      label: "重试",
      icon: <RiRefreshLine size={18} />,
      show: ["failed"].includes(data.status),
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
