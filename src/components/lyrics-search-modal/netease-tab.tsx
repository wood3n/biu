import { useCallback, useState } from "react";

import { Spinner, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, addToast } from "@heroui/react";

import { formatDuration } from "@/common/utils/time";

import LyricsPreviewModal from "./lyrics-preview-modal";

export type AdoptLyricsHandler = (lyricsText: string) => Promise<boolean>;

interface NeteaseTabProps {
  songs: NeteaseSong[];
  loading: boolean;
  onAdoptLyrics: AdoptLyricsHandler;
}

const NeteaseTab = ({ songs, loading, onAdoptLyrics }: NeteaseTabProps) => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewTitle, setPreviewTitle] = useState<string>("");
  const [previewContent, setPreviewContent] = useState<string>("");
  const [previewLoading, setPreviewLoading] = useState(false);

  const normalizeSeconds = (value?: number) => {
    if (!value) return undefined;
    return value > 1000 ? Math.round(value / 1000) : Math.round(value);
  };

  const renderDuration = (value?: number) => {
    const seconds = normalizeSeconds(value);
    if (!seconds) return "--";
    return formatDuration(seconds);
  };

  const renderArtists = (artists?: NeteaseArtist[]) => {
    if (!artists?.length) return "--";
    return artists
      .map(a => a.name)
      .filter(Boolean)
      .join(" / ");
  };

  const handleSelect = useCallback(async (song: NeteaseSong) => {
    const id = song.id;
    if (!id) {
      addToast({ title: "缺少歌曲 ID，无法预览", color: "warning" });
      return;
    }

    setPreviewTitle(song.name || "歌词预览");
    setPreviewContent("");
    setIsPreviewOpen(true);
    setPreviewLoading(true);

    try {
      const res = await window.electron.getNeteaseLyrics({ id });
      const text = res?.lrc?.lyric?.trim() || res?.klyric?.lyric?.trim() || res?.tlyric?.lyric?.trim() || "";

      if (!text) {
        addToast({ title: "未找到歌词内容", color: "warning" });
        setIsPreviewOpen(false);
        return;
      }

      setPreviewContent(text);
    } catch {
      addToast({ title: "获取歌词失败", color: "danger" });
      setIsPreviewOpen(false);
    } finally {
      setPreviewLoading(false);
    }
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
        <Table removeWrapper selectionMode="single" aria-label="netease songs">
          <TableHeader>
            <TableColumn width={200}>歌曲</TableColumn>
            <TableColumn>专辑</TableColumn>
            <TableColumn width={200}>歌手</TableColumn>
            <TableColumn width={90}>时长</TableColumn>
          </TableHeader>
          <TableBody emptyContent="暂无数据" items={songs}>
            {song => (
              <TableRow key={song.id ?? song.name} onClick={() => handleSelect(song)} className="cursor-pointer">
                <TableCell>{song.name || "--"}</TableCell>
                <TableCell>{song.album?.name || "--"}</TableCell>
                <TableCell>{renderArtists(song.artists)}</TableCell>
                <TableCell>{renderDuration(song.duration)}</TableCell>
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
        loading={previewLoading}
        onAdopt={handleAdopt}
      />
    </div>
  );
};

export default NeteaseTab;
