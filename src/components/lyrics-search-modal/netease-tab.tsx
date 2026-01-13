import { useCallback, useState } from "react";

import { Spinner, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, addToast } from "@heroui/react";

import { formatDuration } from "@/common/utils/time";

import LyricsPreviewModal from "./lyrics-preview-modal";

export type AdoptLyricsHandler = (lyricsText: string, tLyricsText?: string) => Promise<boolean>;

interface NeteaseTabProps {
  songs: NeteaseSong[];
  loading: boolean;
  onAdoptLyrics: AdoptLyricsHandler;
}

const NeteaseTab = ({ songs, loading, onAdoptLyrics }: NeteaseTabProps) => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [lyricsTitle, setLyricsTitle] = useState<string>("");
  const [lyrics, setLyrics] = useState<string>("");
  const [tlyrics, setTlyrics] = useState<string>("");
  const [previewLoading, setPreviewLoading] = useState(false);

  const renderDuration = (value?: number) => {
    const seconds = value ? Math.round(value / 1000) : undefined;
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
    setLyrics("");
    setTlyrics("");
    setLyricsTitle("");
    setIsPreviewOpen(true);
    setPreviewLoading(true);

    try {
      const res = await window.electron.getNeteaseLyrics({ id });
      const text = res?.lrc?.lyric?.trim() || res?.klyric?.lyric?.trim() || "";
      const translation = res?.tlyric?.lyric?.trim() || "";

      if (!text) {
        addToast({ title: "未找到歌词内容", color: "warning" });
        setIsPreviewOpen(false);
        return;
      }

      setLyricsTitle(`${song.name || "未知歌曲"}-${renderArtists(song.artists)}`);
      setLyrics(text);
      setTlyrics(translation);
    } catch {
      addToast({ title: "获取歌词失败", color: "danger" });
      setIsPreviewOpen(false);
    } finally {
      setPreviewLoading(false);
    }
  }, []);

  const handleAdopt = useCallback(
    async (lyricsText: string, tLyricsText?: string) => {
      if (!lyricsText) return;
      const ok = await onAdoptLyrics(lyricsText, tLyricsText);
      if (ok) {
        setIsPreviewOpen(false);
      }
    },
    [onAdoptLyrics],
  );

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
              <TableRow key={song.id} onClick={() => handleSelect(song)} className="cursor-pointer">
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
        title={lyricsTitle}
        lyrics={lyrics}
        tlyrics={tlyrics}
        loading={previewLoading}
        onAdopt={handleAdopt}
      />
    </div>
  );
};

export default NeteaseTab;
