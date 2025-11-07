import { useState } from "react";

import {
  Button,
  Card,
  CardBody,
  Chip,
  Image,
  Input,
  Progress,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Tabs,
} from "@heroui/react";
import { filesize } from "filesize";

import { formatSecondsToDate } from "@/common/utils";
import { useDownloadQueue } from "@/store/download-queue";
import { useSettings } from "@/store/settings";

import { StatusDesc } from "./status-desc";

const DownloadList = () => {
  const { downloadPath, update } = useSettings();
  const { list: downloadList, clear: clearDownloadList } = useDownloadQueue();
  const [fileType, setFileType] = useState<string | number>("audio");

  const pickDirectory = async () => {
    const dir = await window.electron.selectDirectory();
    if (dir) {
      update({ downloadPath: dir });
    }
  };

  const openDirectory = async () => {
    await window.electron.openDirectory(downloadPath);
  };

  return (
    <div className="w-full p-4">
      <h1 className="mb-4">下载记录</h1>
      {/* 顶部下载目录管理 */}
      <Card className="mb-4">
        <CardBody>
          <div className="flex flex-col gap-2 md:flex-row md:items-center">
            <div className="flex-1">
              <Input isDisabled value={downloadPath} placeholder="当前下载目录" />
            </div>
            <div className="flex gap-2">
              <Button variant="flat" onPress={pickDirectory}>
                修改下载目录
              </Button>
              <Button variant="flat" onPress={openDirectory}>
                打开本地文件夹
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* 下载文件列表 */}
      <Card>
        <CardBody>
          <div className="w-full overflow-x-auto">
            <Table
              fullWidth
              aria-label="下载列表"
              removeWrapper
              topContent={
                <div className="flex justify-between">
                  <Tabs aria-label="切换文件类型" selectedKey={fileType} onSelectionChange={setFileType}>
                    <Tab key="audio" title="音频" />
                    <Tab key="video" title="视频" />
                  </Tabs>
                  <Button onPress={clearDownloadList}>清空记录</Button>
                </div>
              }
            >
              <TableHeader>
                <TableColumn>文件</TableColumn>
                <TableColumn width={180}>状态</TableColumn>
                <TableColumn width={120}>大小</TableColumn>
                <TableColumn width={140}>下载时间</TableColumn>
              </TableHeader>
              <TableBody items={downloadList.filter(item => item.type === fileType)}>
                {item => {
                  const showProgress = ["downloading", "failed"].includes(item.status as DownloadStatus);
                  const statusDesc = StatusDesc[item.status as DownloadStatus];
                  const isFailed = item.status === "failed";
                  const progressColor = isFailed ? "danger" : "primary";

                  return (
                    <TableRow key={item.id}>
                      <TableCell className="max-w-[280px] truncate">
                        <div className="flex items-center space-x-1">
                          <Image src={item.coverImgUrl} width={48} height={48} className="mr-2 object-cover" />
                          <div className="flex min-w-0 flex-1 flex-col space-y-1 overflow-hidden">
                            <span className="truncate">{item.title}</span>
                            <Chip size="sm" radius="sm" variant="flat">
                              {item.type === "audio" ? "音频" : "视频"}
                            </Chip>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {showProgress ? (
                          <Progress
                            value={item.progress}
                            maxValue={100}
                            showValueLabel
                            size="sm"
                            radius="sm"
                            className="w-full"
                            label={isFailed ? item.error || "下载出错" : statusDesc}
                            color={progressColor}
                          />
                        ) : (
                          <Chip size="sm" radius="sm" variant="flat">
                            {statusDesc}
                          </Chip>
                        )}
                      </TableCell>
                      <TableCell>{item.totalBytes ? filesize(item.totalBytes) : "-"}</TableCell>
                      <TableCell>{item.createTime ? formatSecondsToDate(item.createTime) : "-"}</TableCell>
                    </TableRow>
                  );
                }}
              </TableBody>
            </Table>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default DownloadList;
