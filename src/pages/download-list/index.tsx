import { useEffect, useMemo, useState } from "react";

import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Input,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@heroui/react";

interface FileItem {
  name: string;
  format: string;
  size: number;
  time: number; // mtimeMs
}

const formatBytes = (bytes: number) => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
};

const formatTime = (ms: number) => {
  const d = new Date(ms);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const DownloadList = () => {
  const [settings, setSettings] = useState<SettingsState | null>(null);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(false);

  const currentPath = useMemo(() => settings?.downloadPath ?? "", [settings]);

  const loadSettings = async () => {
    const s = await window.electron.getSettings();
    setSettings(s);
  };

  const loadFiles = async () => {
    setLoading(true);
    try {
      const list = await window.electron.listDownloads();
      setFiles(list ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    loadFiles();
  }, [settings?.downloadPath]);

  const pickDirectory = async () => {
    const dir = await window.electron.selectDirectory();
    if (dir) {
      await window.electron.setSettings({ downloadPath: dir });
      await loadSettings();
    }
  };

  const openDirectory = async () => {
    await window.electron.openDirectory(currentPath);
  };

  return (
    <div className="w-full p-4">
      {/* 顶部下载目录管理 */}
      <Card className="mb-4">
        <CardBody>
          <div className="flex flex-col gap-2 md:flex-row md:items-center">
            <div className="text-lg">下载目录</div>
            <div className="flex-1">
              <Input isDisabled value={currentPath} placeholder="当前下载目录" />
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
        <CardHeader className="flex items-center justify-between">
          <div className="text-lg">下载列表</div>
        </CardHeader>
        <CardBody>
          <div className="w-full overflow-x-auto">
            <Table aria-label="下载列表" removeWrapper className="min-w-[640px]">
              <TableHeader>
                <TableColumn>文件名</TableColumn>
                <TableColumn>文件格式</TableColumn>
                <TableColumn>文件大小</TableColumn>
                <TableColumn>下载时间</TableColumn>
              </TableHeader>
              <TableBody emptyContent={loading ? "加载中..." : "暂无下载文件"} items={files}>
                {(item: FileItem) => (
                  <TableRow key={item.name}>
                    <TableCell className="max-w-[280px] truncate">{item.name}</TableCell>
                    <TableCell className="uppercase">{item.format}</TableCell>
                    <TableCell>{formatBytes(item.size)}</TableCell>
                    <TableCell>{formatTime(item.time)}</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default DownloadList;
