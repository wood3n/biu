import { useCallback, useState } from "react";

import { Spinner, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, addToast } from "@heroui/react";

import { formatDuration } from "@/common/utils/time";

import type { AdoptLyricsHandler } from "./netease-tab";

import LyricsPreviewModal from "./lyrics-preview-modal";

interface LrclibTabProps {
  songs: SearchSongByLrclibResponse[];
  loading: boolean;
  onAdoptLyrics: AdoptLyricsHandler;
}

const LrclibTab = ({ songs, loading, onAdoptLyrics }: LrclibTabProps) => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [lyricsTitle, setLyricsTitle] = useState<string>("");
  const [lyrics, setLyrics] = useState<string>("");

  const renderDuration = (value?: number) => {
    if (!value) return "--";
    return formatDuration(value);
  };

  const handleSelect = useCallback((item: SearchSongByLrclibResponse) => {
    const text = item.syncedLyrics?.trim() || "";
    if (!text) {
      addToast({ title: "未找到歌词内容", color: "warning" });
      return;
    }

    setLyricsTitle(`${item.trackName}-${item.artistName}`);
    setLyrics(text);
    setIsPreviewOpen(true);
  }, []);

  const handleAdopt = useCallback(async () => {
    if (!lyrics) return;
    const ok = await onAdoptLyrics(lyrics);
    if (ok) {
      setIsPreviewOpen(false);
    }
  }, [onAdoptLyrics, lyrics]);

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
              <TableRow key={item.id} onClick={() => handleSelect(item)} className="cursor-pointer">
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
        title={lyricsTitle}
        lyrics={lyrics}
        onAdopt={handleAdopt}
      />
    </div>
  );
};

export default LrclibTab;
