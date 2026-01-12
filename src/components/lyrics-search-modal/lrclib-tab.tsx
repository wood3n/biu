import { useCallback, useState } from "react";

import { Spinner, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, addToast } from "@heroui/react";

import { formatDuration } from "@/common/utils/time";

import type { AdoptLyricsHandler } from "./netease-tab";

import LyricsPreviewModal from "./lyrics-preview-modal";

interface LrclibTabProps {
  songs: SeachSongByLrclibResponse[];
  loading: boolean;
  onAdoptLyrics: AdoptLyricsHandler;
}

const LrclibTab = ({ songs, loading, onAdoptLyrics }: LrclibTabProps) => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewTitle, setPreviewTitle] = useState<string>("");
  const [previewContent, setPreviewContent] = useState<string>("");

  const normalizeSeconds = (value?: number) => {
    if (!value) return undefined;
    return value > 1000 ? Math.round(value / 1000) : Math.round(value);
  };

  const renderDuration = (value?: number) => {
    const seconds = normalizeSeconds(value);
    if (!seconds) return "--";
    return formatDuration(seconds);
  };

  const handleSelect = useCallback((item: SeachSongByLrclibResponse) => {
    const text = item.syncedLyrics?.trim() || item.plainLyrics?.trim() || "";
    if (!text) {
      addToast({ title: "未找到歌词内容", color: "warning" });
      return;
    }

    setPreviewTitle(item.trackName || item.name || "歌词预览");
    setPreviewContent(text);
    setIsPreviewOpen(true);
  }, []);

  const handleAdopt = useCallback(async () => {
    if (!previewContent) return;
    const ok = await onAdoptLyrics(previewContent);
    if (ok) {
      setIsPreviewOpen(false);
    }
  }, [onAdoptLyrics, previewContent]);

  return (
    <div className="h-[340px] overflow-auto">
      {loading ? (
        <div className="flex h-full items-center justify-center">
          <Spinner color="primary" label="加载中" />
        </div>
      ) : (
        <Table removeWrapper selectionMode="single" aria-label="lrclib songs">
          <TableHeader>
            <TableColumn width={200}>歌曲</TableColumn>
            <TableColumn>专辑</TableColumn>
            <TableColumn width={200}>歌手</TableColumn>
            <TableColumn width={90}>时长</TableColumn>
          </TableHeader>
          <TableBody emptyContent="暂无数据" items={songs}>
            {item => (
              <TableRow key={item.id ?? item.name} onClick={() => handleSelect(item)} className="cursor-pointer">
                <TableCell>{item.trackName || item.name || "--"}</TableCell>
                <TableCell>{item.albumName || "--"}</TableCell>
                <TableCell>{item.artistName || "--"}</TableCell>
                <TableCell>{renderDuration(item.duration)}</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}

      <LyricsPreviewModal
        isOpen={isPreviewOpen}
        onOpenChange={setIsPreviewOpen}
        title={previewTitle}
        content={previewContent}
        onAdopt={handleAdopt}
      />
    </div>
  );
};

export default LrclibTab;
