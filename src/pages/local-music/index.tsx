import { useEffect, useMemo, useRef, useState } from "react";

import { Button, Select, SelectItem } from "@heroui/react";
import { RiDeleteBinLine, RiFolderAddLine, RiRefreshLine, RiPlayFill, RiPlayListAddLine } from "@remixicon/react";
import { useVirtualizer } from "@tanstack/react-virtual";

import Empty from "@/components/empty";
import IconButton from "@/components/icon-button";
import ScrollContainer, { type ScrollRefObject } from "@/components/scroll-container";
import SearchButton from "@/components/search-button";
import { useModalStore } from "@/store/modal";
import { usePlayList } from "@/store/play-list";
import { useSettings } from "@/store/settings";

import LocalMusicItemRow from "./item";

const rowHeight = 42;

const LocalMusicPage = () => {
  const localDirs = useSettings(s => s.localMusicDirs);
  const updateSettings = useSettings(s => s.update);
  const { onOpenConfirmModal } = useModalStore();
  const [list, setList] = useState<LocalMusicItem[]>([]);
  const [selectedDir, setSelectedDir] = useState<string>("all");
  const [keyword, setKeyword] = useState<string>("");
  const scrollRef = useRef<ScrollRefObject | null>(null);
  const playId = usePlayList(s => s.playId);
  const playList = usePlayList(s => s.list);

  const playItem = useMemo(() => playList.find(item => item.id === playId), [playId, playList]);

  useEffect(() => {
    const init = async () => {
      if (localDirs?.length) {
        const data = await window.electron.scanLocalMusic(localDirs);
        setList(data);
      } else {
        setList([]);
      }
    };
    init();
  }, [localDirs]);

  const filtered = useMemo(() => {
    return list
      .filter(item => (selectedDir === "all" ? true : item.dir === selectedDir))
      .filter(item => (keyword ? item.title.toLowerCase().includes(keyword.toLowerCase()) : true));
  }, [list, selectedDir, keyword]);

  const toFileUrl = (p: string) => `file://${p.replace(/\\/g, "/")}`;

  const getDirName = (p: string) => {
    const trimmed = p.replace(/[\\/]+$/, "");
    const parts = trimmed.split(/[/\\]/);
    return parts[parts.length - 1] || trimmed;
  };

  const rowVirtualizer = useVirtualizer({
    count: filtered.length,
    getScrollElement: () => scrollRef.current?.osInstance()?.elements().viewport as HTMLElement | null,
    estimateSize: () => rowHeight,
    overscan: 10,
  });

  const playAll = async () => {
    await usePlayList.getState().playList(
      list.map(i => ({
        type: "audio" as const,
        source: "local" as const,
        id: i.id,
        title: i.title,
        audioUrl: toFileUrl(i.path),
      })),
    );
  };

  const addAllToPlaylist = () => {
    if (!filtered.length) return;
    const items = filtered.map(i => ({
      type: "audio" as const,
      source: "local" as const,
      id: i.id,
      title: i.title,
      audioUrl: toFileUrl(i.path),
    }));
    usePlayList.getState().addList?.(items);
  };

  const addDirectory = async () => {
    const dir = await window.electron.selectDirectory();
    if (!dir) return;
    const next = Array.from(new Set([...(localDirs || []), dir]));
    updateSettings({ localMusicDirs: next });
    setSelectedDir("all");
  };

  const removeSelectedDirectory = () => {
    if (selectedDir === "all") return;
    onOpenConfirmModal({
      title: "移除目录",
      description: "仅移除列表中的目录，不会删除本地文件",
      onConfirm: async () => {
        const next = (localDirs || []).filter(d => d !== selectedDir);
        updateSettings({ localMusicDirs: next });
        setSelectedDir("all");
        return true;
      },
      confirmText: "移除",
      type: "warning",
    });
  };

  const rescan = async () => {
    if (!localDirs?.length) {
      setList([]);
      return;
    }
    const data = await window.electron.scanLocalMusic(localDirs);
    setList(data);
  };

  const openFile = async (filePath: string) => {
    await window.electron.showFileInFolder(filePath);
  };

  const playFile = async (song: LocalMusicItem) => {
    usePlayList.getState().play({
      id: song.id,
      source: "local" as const,
      type: "audio" as const,
      title: song.title,
      audioUrl: toFileUrl(song.path),
    });
  };

  const addToNext = (song: LocalMusicItem) => {
    usePlayList.getState().addToNext({
      id: song.id,
      source: "local" as const,
      type: "audio" as const,
      title: song.title,
      audioUrl: toFileUrl(song.path),
    });
  };

  const deleteFile = (filePath: string) => {
    onOpenConfirmModal({
      title: "删除文件",
      description: "该操作会删除本地文件且不可恢复，请谨慎操作",
      onConfirm: async () => {
        const ok = await window.electron.deleteLocalMusicFile(filePath);
        if (ok) {
          setList(prev => prev.filter(i => i.path !== filePath));
          return true;
        }
        return false;
      },
      confirmText: "删除",
      type: "danger",
    });
  };

  console.log("filtered", filtered);

  return (
    <ScrollContainer ref={scrollRef} enableBackToTop className="h-full w-full px-4">
      <div className="mb-2 flex items-center justify-between">
        <h1 className="flex items-center space-x-1">本地音乐</h1>
        <div className="flex items-center space-x-1">
          <Button size="sm" variant="flat" startContent={<RiFolderAddLine size={18} />} onPress={addDirectory}>
            添加目录
          </Button>
        </div>
      </div>
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {Boolean(list.length) && (
            <Button
              color="primary"
              className="dark:text-black"
              startContent={<RiPlayFill size={18} />}
              onPress={playAll}
            >
              播放全部
            </Button>
          )}

          <IconButton size="md" variant="flat" color="default" tooltip="添加到播放列表" onPress={addAllToPlaylist}>
            <RiPlayListAddLine size={18} />
          </IconButton>
        </div>
        <div className="flex items-center gap-2">
          <SearchButton
            onSearch={val => {
              setKeyword(val);
            }}
          />
          <Select
            className="w-[200px]"
            listboxProps={{
              color: "primary",
              hideSelectedIcon: true,
            }}
            items={[
              { key: "all", label: "全部目录" },
              ...(localDirs || []).map(dir => ({ key: dir, label: getDirName(dir) })),
            ]}
            selectedKeys={[selectedDir]}
            onSelectionChange={keys => {
              const v = Array.from(keys as Set<string>)[0];
              setSelectedDir(v);
            }}
          >
            {item => <SelectItem key={item.key}>{item.label as string}</SelectItem>}
          </Select>
          <IconButton variant="flat" size="md" color="default" tooltip="刷新" onPress={rescan}>
            <RiRefreshLine size={18} />
          </IconButton>
          <IconButton
            tooltip="移除当前目录"
            size="md"
            variant="flat"
            color="default"
            isDisabled={selectedDir === "all"}
            onPress={removeSelectedDirectory}
          >
            <RiDeleteBinLine size={18} />
          </IconButton>
        </div>
      </div>
      <div className="text-foreground-500 grid w-full grid-cols-[40px_minmax(0,1fr)_100px_100px_100px_100px_40px] items-center gap-4 rounded-md px-2 py-1 text-xs">
        <div className="text-center">#</div>
        <div>标题</div>
        <div className="text-right">大小</div>
        <div className="text-right">格式</div>
        <div className="text-right">时长</div>
        <div className="text-right">创建时间</div>
        <div className="text-right" />
      </div>
      {filtered.length === 0 ? (
        <Empty />
      ) : (
        <div className="relative">
          <div
            style={{
              height: rowVirtualizer.getTotalSize(),
              position: "relative",
              width: "100%",
            }}
          >
            {rowVirtualizer.getVirtualItems().map(vItem => {
              const song = filtered[vItem.index];

              return (
                <div
                  key={vItem.key}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: rowHeight,
                    transform: `translateY(${vItem.start}px)`,
                  }}
                >
                  <LocalMusicItemRow
                    data={song}
                    isPlaying={playItem?.id === song.id}
                    index={vItem.index + 1}
                    onAddToNext={() => addToNext(song)}
                    onPlay={() => playFile(song)}
                    onOpen={() => openFile(song.path)}
                    onDelete={() => deleteFile(song.path)}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </ScrollContainer>
  );
};
export default LocalMusicPage;
