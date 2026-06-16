import { useEffect, useMemo, useRef, useState } from "react";

import { addToast, Button, Checkbox, Select, SelectItem } from "@heroui/react";
import {
  RiCheckboxMultipleLine,
  RiCloseLine,
  RiFolderAddLine,
  RiMagicLine,
  RiRefreshLine,
  RiPlayFill,
  RiPlayListAddLine,
} from "@remixicon/react";
import { useVirtualizer } from "@tanstack/react-virtual";

import Empty from "@/components/empty";
import IconButton from "@/components/icon-button";
import ScrollContainer, { type ScrollRefObject } from "@/components/scroll-container";
import SearchButton from "@/components/search-button";
import { useLocateLocalSong } from "@/store/locate-local-song";
import { useModalStore } from "@/store/modal";
import { usePlayList } from "@/store/play-list";
import { useSettings } from "@/store/settings";

import LocalMusicItemRow from "./item";
import MatchLyricsModal from "./match-lyrics-modal";
import { useBatchMatchLyrics, type MatchOptions } from "./use-batch-match-lyrics";

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

  const { progress: matchProgress, start: startBatchMatch } = useBatchMatchLyrics();

  // 匹配歌词设置弹窗：批量与单行共用，targets 为待匹配的本地歌曲
  const [matchModalOpen, setMatchModalOpen] = useState(false);
  const [matchTargets, setMatchTargets] = useState<LocalMusicItem[]>([]);

  const openMatchModal = (targets: LocalMusicItem[]) => {
    if (!targets.length) return;
    setMatchTargets(targets);
    setMatchModalOpen(true);
  };

  const confirmMatch = (opts: MatchOptions) => {
    startBatchMatch(matchTargets, opts);
  };

  // 批量操作模式：行首复选框，顶部按钮作用于已勾选项
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());

  // 目录下拉受控：点叉移除前先关闭，避免下拉浮层挡住确认弹窗
  const [dirSelectOpen, setDirSelectOpen] = useState(false);

  // 首次扫描是否已完成：定位时若列表尚未扫出，先等待而非误报"未找到"
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    const init = async () => {
      if (localDirs?.length) {
        const data = await window.electron.scanLocalMusic(localDirs);
        setList(data);
      } else {
        setList([]);
      }
      setScanned(true);
    };
    init();
  }, [localDirs]);

  const filtered = useMemo(() => {
    return list
      .filter(item => (selectedDir === "all" ? true : item.dir === selectedDir))
      .filter(item => (keyword ? item.title.toLowerCase().includes(keyword.toLowerCase()) : true));
  }, [list, selectedDir, keyword]);

  const exitSelectMode = () => {
    setSelectMode(false);
    setSelectedIds(new Set());
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const allSelected = filtered.length > 0 && filtered.every(i => selectedIds.has(i.id));

  const toggleSelectAll = () => {
    setSelectedIds(allSelected ? new Set() : new Set(filtered.map(i => i.id)));
  };

  const selectedSongs = useMemo(() => filtered.filter(i => selectedIds.has(i.id)), [filtered, selectedIds]);

  const addSongsToPlaylist = (songs: LocalMusicItem[]) => {
    if (!songs.length) return;
    usePlayList.getState().addList(
      songs.map(i => ({
        type: "audio" as const,
        source: "local" as const,
        id: i.id,
        title: i.title,
        audioUrl: toFileUrl(i.path),
      })),
    );
    addToast({ title: `${songs.length}首歌曲已添加到播放列表`, color: "success" });
  };

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

  // 左下角播放栏请求定位：滚动到该本地歌所在行。若被目录/搜索过滤隐藏，先清过滤再于 filtered 更新后滚动
  const locateNonce = useLocateLocalSong(s => s.nonce);
  const pendingLocateId = useRef<string | null>(null);

  useEffect(() => {
    const { targetId } = useLocateLocalSong.getState();
    if (!targetId) return;
    useLocateLocalSong.getState().clear();
    // 仅记录待定位 id 并清空过滤；是否存在交给下方 effect 在列表扫出后判定，避免初次挂载列表未就绪时误报
    pendingLocateId.current = targetId;
    setSelectedDir("all");
    setKeyword("");
  }, [locateNonce]);

  // 依赖 locateNonce：本就在本页且无过滤可清时，filtered 引用不变，仅靠它无法触发滚动
  useEffect(() => {
    const targetId = pendingLocateId.current;
    if (!targetId) return;
    const idx = filtered.findIndex(i => i.id === targetId);
    if (idx >= 0) {
      pendingLocateId.current = null;
      rowVirtualizer.scrollToIndex(idx, { align: "center" });
      return;
    }
    // 扫描已完成但仍找不到 → 确实不在已扫描目录内；扫描未完成则继续等待 list 更新
    if (scanned && !list.some(i => i.id === targetId)) {
      pendingLocateId.current = null;
      addToast({ title: "未在列表中找到该歌曲", color: "warning" });
    }
  }, [filtered, list, scanned, locateNonce, rowVirtualizer]);

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

  const addDirectory = async () => {
    const dir = await window.electron.selectDirectory();
    if (!dir) return;
    const next = Array.from(new Set([...(localDirs || []), dir]));
    updateSettings({ localMusicDirs: next });
    setSelectedDir("all");
  };

  const removeDirectory = (dir: string) => {
    if (!dir || dir === "all") return;
    onOpenConfirmModal({
      title: "移除目录",
      description: "仅移除列表中的目录，不会删除本地文件",
      onConfirm: async () => {
        const next = (localDirs || []).filter(d => d !== dir);
        updateSettings({ localMusicDirs: next });
        if (selectedDir === dir) setSelectedDir("all");
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
    // 按需读取内嵌封面：有则播放面板显示封面，无则回退纯歌词
    const cover = await window.electron.readLocalCover(song.path);
    usePlayList.getState().play({
      id: song.id,
      source: "local" as const,
      type: "audio" as const,
      title: song.title,
      audioUrl: toFileUrl(song.path),
      cover: cover ?? undefined,
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

  const addToPlayList = (song: LocalMusicItem) => {
    usePlayList.getState().addList([
      {
        id: song.id,
        source: "local" as const,
        type: "audio" as const,
        title: song.title,
        audioUrl: toFileUrl(song.path),
      },
    ]);

    addToast({
      title: "已添加到播放列表",
      color: "success",
    });
  };

  const deleteFile = (song: LocalMusicItem) => {
    onOpenConfirmModal({
      title: "删除文件",
      description: (
        <>
          <div className="text-foreground truncate font-medium">{song.title}</div>
          <div>该操作会删除本地文件且不可恢复，请谨慎操作</div>
        </>
      ),
      onConfirm: async () => {
        const ok = await window.electron.deleteLocalMusicFile(song.path);
        if (ok) {
          setList(prev => prev.filter(i => i.path !== song.path));
          return true;
        }
        return false;
      },
      confirmText: "删除",
      type: "danger",
    });
  };

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
          {selectMode ? (
            <>
              <Button size="md" variant="flat" color="default" onPress={toggleSelectAll}>
                {allSelected ? "取消全选" : "全选"}
              </Button>

              <IconButton
                size="md"
                variant="flat"
                color="default"
                tooltip="添加到播放列表"
                isDisabled={!selectedSongs.length}
                onPress={() => addSongsToPlaylist(selectedSongs)}
              >
                <RiPlayListAddLine size={18} />
              </IconButton>

              <Button
                size="md"
                variant="flat"
                color="default"
                startContent={!matchProgress.running && <RiMagicLine size={18} />}
                isLoading={matchProgress.running}
                isDisabled={!selectedSongs.length}
                onPress={() => openMatchModal(selectedSongs)}
              >
                {matchProgress.running
                  ? `匹配中 ${matchProgress.done}/${matchProgress.total}`
                  : `一键匹配歌词${selectedSongs.length ? `（${selectedSongs.length}）` : ""}`}
              </Button>

              <Button size="md" variant="light" color="default" onPress={exitSelectMode}>
                退出
              </Button>
            </>
          ) : (
            <>
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

              {Boolean(filtered.length) && (
                <IconButton
                  size="md"
                  variant="flat"
                  color="default"
                  tooltip="添加到播放列表"
                  onPress={() => addSongsToPlaylist(filtered)}
                >
                  <RiPlayListAddLine size={18} />
                </IconButton>
              )}

              {Boolean(filtered.length) && (
                <Button
                  size="md"
                  variant="flat"
                  color="default"
                  startContent={!matchProgress.running && <RiMagicLine size={18} />}
                  isLoading={matchProgress.running}
                  onPress={() => openMatchModal(filtered)}
                >
                  {matchProgress.running ? `匹配中 ${matchProgress.done}/${matchProgress.total}` : "一键匹配歌词"}
                </Button>
              )}
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          <SearchButton
            onSearch={val => {
              setKeyword(val);
            }}
          />
          <Select
            className="w-[200px]"
            disallowEmptySelection
            isOpen={dirSelectOpen}
            onOpenChange={setDirSelectOpen}
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
            {item => (
              <SelectItem
                key={item.key}
                endContent={
                  item.key === "all" ? undefined : (
                    <span
                      role="button"
                      tabIndex={-1}
                      aria-label="移除目录"
                      className="text-foreground-400 hover:text-danger flex items-center"
                      onClick={e => {
                        e.stopPropagation();
                        setDirSelectOpen(false);
                        removeDirectory(item.key);
                      }}
                    >
                      <RiCloseLine size={16} />
                    </span>
                  )
                }
              >
                {item.label as string}
              </SelectItem>
            )}
          </Select>
          <IconButton variant="flat" size="md" color="default" tooltip="刷新" onPress={rescan}>
            <RiRefreshLine size={18} />
          </IconButton>
          {!selectMode && Boolean(list.length) && (
            <IconButton variant="flat" size="md" color="default" tooltip="批量操作" onPress={() => setSelectMode(true)}>
              <RiCheckboxMultipleLine size={18} />
            </IconButton>
          )}
        </div>
      </div>
      <div className="text-foreground-500 grid w-full grid-cols-[40px_minmax(0,1fr)_100px_100px_100px_100px_40px] items-center gap-4 rounded-md px-2 py-1 text-xs">
        <div className="flex items-center justify-center">
          {selectMode ? (
            <Checkbox size="sm" isSelected={allSelected} onValueChange={toggleSelectAll} aria-label="全选" />
          ) : (
            "#"
          )}
        </div>
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
                    selectMode={selectMode}
                    selected={selectedIds.has(song.id)}
                    onToggleSelect={() => toggleSelect(song.id)}
                    onAddToNext={() => addToNext(song)}
                    onAddToPlayList={() => addToPlayList(song)}
                    onMatchLyrics={() => openMatchModal([song])}
                    onPlay={() => playFile(song)}
                    onOpen={() => openFile(song.path)}
                    onDelete={() => deleteFile(song)}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}
      <MatchLyricsModal
        isOpen={matchModalOpen}
        count={matchTargets.length}
        onOpenChange={setMatchModalOpen}
        onConfirm={confirmMatch}
      />
    </ScrollContainer>
  );
};
export default LocalMusicPage;
