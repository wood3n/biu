import { useEffect, useState } from "react";

import {
  Button,
  Card,
  CardBody,
  Chip,
  Image,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Tabs,
  Tooltip,
} from "@heroui/react";
import { RiDeleteBinLine, RiFolderLine, RiMusicLine, RiVideoLine } from "@remixicon/react";
import { filesize } from "filesize";

import { formatMillisecond } from "@/common/utils";
import Empty from "@/components/empty";
import ScrollContainer from "@/components/scroll-container";
import { useSettings } from "@/store/settings";

import DownloadActions from "./actions";
import DownloadProgress from "./progress";

const DownloadList = () => {
  const downloadPath = useSettings(s => s.downloadPath);
  const [downloadList, setDownloadList] = useState<MediaDownloadTask[]>([]);
  const [fileType, setFileType] = useState<string | number>("audio");

  useEffect(() => {
    const initList = async () => {
      const list = await window.electron.getMediaDownloadTaskList();
      if (list) {
        setDownloadList(list);
      }
    };

    initList();

    const removeListener = window.electron.syncMediaDownloadTaskList((payload: any) => {
      if (Array.isArray(payload)) {
        setDownloadList(payload as MediaDownloadTask[]);
      } else if (payload?.type === "full") {
        setDownloadList(payload.data);
      } else if (payload?.type === "update") {
        setDownloadList(prev => {
          const currentMap = new Map(prev.map(item => [item.id, item]));
          (payload.data as MediaDownloadTask[]).forEach(item => {
            currentMap.set(item.id, item);
          });
          return Array.from(currentMap.values());
        });
      }
    });

    return () => {
      removeListener();
    };
  }, []);

  const clearDownloadList = async () => {
    await window.electron.clearMediaDownloadTaskList();
  };

  const openDirectory = async () => {
    await window.electron.openDirectory(downloadPath);
  };

  const getFileQuality = (item: MediaDownloadTask) => {
    if (item.outputFileType === "video") {
      return `${item.videoResolution}@${item.videoFrameRate}`;
    }

    if (item.audioCodecs === "flac") {
      return "flac";
    }

    if (item.audioCodecs?.includes("ec-3")) {
      return "杜比音频";
    }

    if (item.audioBandwidth) {
      return `${Math.round(item.audioBandwidth / 1000)} kbps`;
    }

    return "";
  };

  return (
    <ScrollContainer className="h-full w-full p-4">
      <div className="mb-4 flex items-center justify-between">
        <h1>下载记录</h1>
        <div className="flex items-center space-x-1">
          <Tooltip content="打开目录" closeDelay={0}>
            <Button variant="flat" onPress={openDirectory} startContent={<RiFolderLine size={18} />}>
              {downloadPath}
            </Button>
          </Tooltip>
        </div>
      </div>
      <Card radius="md">
        <CardBody>
          <div className="w-full overflow-x-auto">
            <Table
              fullWidth
              radius="md"
              aria-label="下载列表"
              removeWrapper
              topContent={
                <div className="flex justify-between">
                  <Tabs
                    radius="md"
                    classNames={{
                      cursor: "rounded-medium",
                    }}
                    aria-label="切换文件类型"
                    selectedKey={fileType}
                    onSelectionChange={setFileType}
                  >
                    <Tab key="audio" title="音频" />
                    <Tab key="video" title="视频" />
                  </Tabs>
                  <Tooltip content="清空记录" closeDelay={0}>
                    <Button size="sm" isIconOnly onPress={clearDownloadList}>
                      <RiDeleteBinLine size={18} />
                    </Button>
                  </Tooltip>
                </div>
              }
              classNames={{
                th: "first:rounded-s-medium last:rounded-e-medium",
              }}
            >
              <TableHeader className="rounded-medium">
                <TableColumn>文件</TableColumn>
                <TableColumn width={200}>状态</TableColumn>
                <TableColumn width={120}>大小</TableColumn>
                <TableColumn width={140}>下载时间</TableColumn>
                <TableColumn width={120} align="center">
                  操作
                </TableColumn>
              </TableHeader>
              <TableBody items={downloadList.filter(item => item.outputFileType === fileType)} emptyContent={<Empty />}>
                {item => {
                  const quality = getFileQuality(item);

                  return (
                    <TableRow key={item.id}>
                      <TableCell className="max-w-[280px] truncate">
                        <div className="flex items-center space-x-2">
                          <Image
                            src={item.cover}
                            fallbackSrc={
                              item.outputFileType === "audio" ? <RiMusicLine size={48} /> : <RiVideoLine size={48} />
                            }
                            width={48}
                            height={48}
                            className="mr-2 object-cover"
                          />
                          <div className="flex min-w-0 flex-1 flex-col space-y-1 overflow-hidden">
                            <span className="truncate">{item.title}</span>
                            {Boolean(quality) && (
                              <Chip size="sm" radius="sm" variant="flat">
                                {getFileQuality(item)}
                              </Chip>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <DownloadProgress data={item} />
                      </TableCell>
                      <TableCell>{item.totalBytes ? filesize(item.totalBytes) : "-"}</TableCell>
                      <TableCell>{item.createdTime ? formatMillisecond(item.createdTime) : "-"}</TableCell>
                      <TableCell>
                        <DownloadActions data={item} />
                      </TableCell>
                    </TableRow>
                  );
                }}
              </TableBody>
            </Table>
          </div>
        </CardBody>
      </Card>
    </ScrollContainer>
  );
};

export default DownloadList;
