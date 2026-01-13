import { useCallback, useEffect, useRef, useState } from "react";

import { Button, Input, Modal, ModalBody, ModalContent, ModalHeader, Tab, Tabs, addToast } from "@heroui/react";

import { usePlayList } from "@/store/play-list";
import { StoreNameMap } from "@shared/store";

import type { AdoptLyricsHandler } from "./netease-tab";

import LrclibTab from "./lrclib-tab";
import NeteaseTab from "./netease-tab";

const NETEASE_TYPE_SONG = 1;
const DEFAULT_LIMIT = 20;

interface Props {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onLyricsAdopted?: (lyricsText?: string, tLyricsText?: string) => void;
}

const LyricsSearchModal = ({ isOpen, onOpenChange, onLyricsAdopted }: Props) => {
  const playId = usePlayList(state => state.playId);
  const getPlayItem = usePlayList(state => state.getPlayItem);
  const [keyword, setKeyword] = useState("");
  const [activeTab, setActiveTab] = useState<"netease" | "lrclib">("netease");
  const [neteaseSongs, setNeteaseSongs] = useState<NeteaseSong[]>([]);
  const [lrclibSongs, setLrclibSongs] = useState<SearchSongByLrclibResponse[]>([]);
  const [neteaseLoading, setNeteaseLoading] = useState(false);
  const [lrclibLoading, setLrclibLoading] = useState(false);
  const keywordRef = useRef("");

  const resetState = useCallback(() => {
    setKeyword("");
    setActiveTab("netease");
    setNeteaseSongs([]);
    setLrclibSongs([]);
    setNeteaseLoading(false);
    setLrclibLoading(false);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const playItem = getPlayItem();
    if (playItem) {
      setKeyword(playItem.pageTitle || playItem.title);
      setNeteaseSongs([]);
      setLrclibSongs([]);
    }
  }, [playId, isOpen, getPlayItem]);

  useEffect(() => {
    keywordRef.current = keyword;
  }, [keyword]);

  const handleSubmit = useCallback(
    async (tab: "netease" | "lrclib" = activeTab) => {
      const query = keywordRef.current.trim();
      if (query === "") return;

      if (tab === "netease") {
        setLrclibLoading(false);
        try {
          setNeteaseLoading(true);
          const res = await window.electron.searchNeteaseSongs({
            s: query,
            type: NETEASE_TYPE_SONG,
            limit: DEFAULT_LIMIT,
            offset: 0,
          });

          setNeteaseSongs(res?.result?.songs ?? []);
        } catch {
          setNeteaseSongs([]);
          addToast({ title: "网易云搜索失败", color: "danger" });
        } finally {
          setNeteaseLoading(false);
        }
      } else {
        setNeteaseLoading(false);
        try {
          setLrclibLoading(true);
          const res = await window.electron.searchLrclibLyrics({ q: query });
          setLrclibSongs(res ?? []);
        } catch {
          setLrclibSongs([]);
          addToast({ title: "LrcLib 搜索失败", color: "danger" });
        } finally {
          setLrclibLoading(false);
        }
      }
    },
    [activeTab],
  );

  useEffect(() => {
    if (isOpen) {
      void handleSubmit(activeTab);
    }
  }, [isOpen, activeTab, handleSubmit]);

  const handleAdoptLyrics = useCallback<AdoptLyricsHandler>(
    async (lyricsText, tLyricsText) => {
      if (!lyricsText && !tLyricsText) return false;

      const current = getPlayItem();
      const cid = current?.cid ? Number(current.cid) : undefined;

      if (!current?.bvid || cid === undefined || Number.isNaN(cid)) {
        addToast({ title: "当前播放信息缺失，无法保存歌词", color: "warning" });
        return false;
      }

      const nextLyrics: MusicLyrics = {
        lyrics: lyricsText,
        tLyrics: tLyricsText,
      };

      try {
        const store = await window.electron.getStore(StoreNameMap.LyricsCache);
        const key = `${current.bvid}-${current.cid}`;
        const prev = store?.[key] || {};
        const nextStore = { ...(store ?? {}), [key]: { ...prev, ...nextLyrics } };
        await window.electron.setStore(StoreNameMap.LyricsCache, nextStore);
        onLyricsAdopted?.(lyricsText, tLyricsText);
        return true;
      } catch {
        addToast({ title: "歌词保存失败", color: "danger" });
        return false;
      }
    },
    [getPlayItem, onLyricsAdopted],
  );

  const handleOpenChange = useCallback(
    (open: boolean) => {
      onOpenChange(open);
      if (!open) {
        resetState();
      }
    },
    [onOpenChange, resetState],
  );

  return (
    <Modal isOpen={isOpen} onOpenChange={handleOpenChange} scrollBehavior="inside" size="4xl" disableAnimation>
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">搜索歌词</ModalHeader>
        <ModalBody className="pb-6">
          <div className="flex gap-2">
            <Input
              value={keyword}
              onValueChange={setKeyword}
              placeholder="请输入歌曲或歌手名称"
              onKeyDown={e => {
                if (e.key === "Enter") handleSubmit(activeTab);
              }}
            />
            <Button color="primary" onPress={() => handleSubmit(activeTab)}>
              搜索
            </Button>
          </div>
          <Tabs
            selectedKey={activeTab}
            onSelectionChange={key => {
              const nextTab = key as "netease" | "lrclib";
              setActiveTab(nextTab);
              setNeteaseLoading(false);
              setLrclibLoading(false);
              setNeteaseSongs([]);
              setLrclibSongs([]);
            }}
            classNames={{
              panel: "py-0",
            }}
          >
            <Tab key="netease" title="网易云" />
            <Tab key="lrclib" title="LrcLib" />
          </Tabs>
          {activeTab === "netease" ? (
            <NeteaseTab songs={neteaseSongs} loading={neteaseLoading} onAdoptLyrics={handleAdoptLyrics} />
          ) : (
            <LrclibTab songs={lrclibSongs} loading={lrclibLoading} onAdoptLyrics={handleAdoptLyrics} />
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default LyricsSearchModal;
