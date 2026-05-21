import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { useNavigate, useParams } from "react-router";

import { DndContext, type DragEndEvent, closestCenter, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { addToast, Button } from "@heroui/react";
import {
  RiArrowLeftSLine,
  RiDeleteBinLine,
  RiDownload2Line,
  RiMenuLine,
  RiPlayFill,
  RiPlayListAddLine,
  RiPlayListLine,
} from "@remixicon/react";

import type { ContextMenuItem } from "@/components/context-menu";

import Empty from "@/components/empty";
import MusicListItem from "@/components/music-list-item";
import ScrollContainer from "@/components/scroll-container";
import { usePlayList, type PlayItem } from "@/store/play-list";
import { useUserPlaylistStore } from "@/store/user-playlist";

const DraggableMusicListItem = ({
  song,
  index,
  menus,
  onMenuAction,
  onPress,
}: {
  song: PlayItem;
  index: number;
  menus: ContextMenuItem[];
  onMenuAction: (key: string) => void;
  onPress: () => void;
}) => {
  const sortId = `${song.bvid ?? song.sid ?? song.id ?? ""}`;
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: sortId });

  const style: CSSProperties = useMemo(
    () => ({
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.4 : 1,
    }),
    [transform, transition, isDragging],
  );

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <MusicListItem
        index={index + 1}
        title={<span dangerouslySetInnerHTML={{ __html: song.title }} />}
        type={song.type}
        bvid={song.bvid}
        sid={song.sid}
        cover={song.cover}
        upName={song.ownerName}
        upMid={song.ownerMid}
        menus={menus}
        onMenuAction={onMenuAction}
        onPress={onPress}
        dragHandle={
          <div
            {...listeners}
            className="inline-flex cursor-grab items-center justify-center gap-1 active:cursor-grabbing"
          >
            <RiMenuLine size={14} className="text-foreground-400" />
            <span>{index + 1}</span>
          </div>
        }
      />
    </div>
  );
};

const PlaylistDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const playlists = useUserPlaylistStore(s => s.playlists);
  const removeSongFromPlaylist = useUserPlaylistStore(s => s.removeSongFromPlaylist);
  const reorderPlaylistSongs = useUserPlaylistStore(s => s.reorderPlaylistSongs);
  const renamePlaylist = useUserPlaylistStore(s => s.renamePlaylist);
  const deletePlaylist = useUserPlaylistStore(s => s.deletePlaylist);

  const pl = useMemo(() => playlists.find(p => p.id === id), [playlists, id]);

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) inputRef.current?.focus();
  }, [isEditing]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  );

  const handleMenuAction = (key: string, index: number) => {
    if (!pl) return;
    const song = pl.songs[index];
    if (!song) return;

    switch (key) {
      case "play":
        usePlayList.getState().play(song);
        break;
      case "play-next":
        usePlayList.getState().addToNext(song);
        addToast({ title: "已添加到下一首播放", color: "success" });
        break;
      case "add-to-playlist":
        usePlayList.getState().addList([song]);
        addToast({ title: "已添加到播放列表", color: "success" });
        break;
      case "remove":
        removeSongFromPlaylist(pl.id, index);
        addToast({ title: "已从歌单移除", color: "success" });
        break;
    }
  };

  const handlePlayAll = () => {
    if (!pl || pl.songs.length === 0) return;
    usePlayList.getState().playList(pl.songs);
    addToast({ title: `正在播放「${pl.name}」`, color: "success" });
  };

  const handleAddAll = () => {
    if (!pl || pl.songs.length === 0) return;
    usePlayList.getState().addList(pl.songs);
    addToast({ title: `已添加 ${pl.songs.length} 首到播放列表`, color: "success" });
  };

  const handleDownloadAll = async () => {
    if (!pl || pl.songs.length === 0) return;

    const existingTasks = await window.electron.getMediaDownloadTaskList();
    const existingBvids = new Set(existingTasks.map(t => t.bvid).filter(Boolean));
    const existingSids = new Set(existingTasks.map(t => t.sid?.toString()).filter(Boolean));

    const toDownload = pl.songs.filter(song => {
      if (song.bvid && existingBvids.has(song.bvid)) return false;
      if (song.sid && existingSids.has(song.sid?.toString())) return false;
      return true;
    });

    if (toDownload.length === 0) {
      addToast({ title: "歌单中的歌曲均已下载", color: "warning" });
      return;
    }

    const tasks = toDownload.map(song => ({
      outputFileType: "audio" as const,
      title: song.title,
      cover: song.cover,
      bvid: song.bvid,
      sid: song.sid,
    }));

    await window.electron.addMediaDownloadTaskList(tasks);
    addToast({
      title: `已添加 ${tasks.length} 个下载任务${tasks.length < pl.songs.length ? `（${pl.songs.length - tasks.length} 个已存在）` : ""}`,
      color: "success",
    });
  };

  const handleStartRename = () => {
    if (!pl) return;
    setEditName(pl.name);
    setIsEditing(true);
  };

  const handleRename = () => {
    if (!pl || !editName.trim()) return;
    renamePlaylist(pl.id, editName);
    setIsEditing(false);
    addToast({ title: "已重命名", color: "success" });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    if (!pl) return;
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = pl.songs.findIndex(s => `${s.bvid ?? s.sid ?? s.id ?? ""}` === active.id);
    const newIndex = pl.songs.findIndex(s => `${s.bvid ?? s.sid ?? s.id ?? ""}` === over.id);
    if (oldIndex !== -1 && newIndex !== -1) {
      reorderPlaylistSongs(pl.id, oldIndex, newIndex);
    }
  };

  const handleDelete = () => {
    if (!pl) return;
    deletePlaylist(pl.id);
    addToast({ title: "歌单已删除", color: "success" });
    navigate("/playlists");
  };

  if (!pl) {
    return (
      <ScrollContainer>
        <div className="flex flex-col items-center justify-center gap-4 p-6">
          <Empty description="歌单不存在" />
          <Button variant="flat" onPress={() => navigate("/playlists")}>
            <RiArrowLeftSLine size={18} />
            返回歌单列表
          </Button>
        </div>
      </ScrollContainer>
    );
  }

  const pageMenus = [
    { key: "play-next", label: "下一首播放", icon: <RiPlayFill size={18} /> },
    { key: "add-to-playlist", label: "添加到播放列表", icon: <RiPlayListAddLine size={18} /> },
    { key: "remove", label: "从歌单移除", icon: <RiDeleteBinLine size={18} />, color: "danger" as const },
  ];

  return (
    <ScrollContainer>
      <div className="flex flex-col gap-6 p-6">
        {/* Header */}
        <div className="flex items-start gap-6">
          <div className="flex h-48 w-48 flex-none items-center justify-center overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-800">
            {pl.songs.length > 0 && pl.songs[0]?.cover ? (
              <img src={pl.songs[0].cover} alt="" className="h-full w-full object-cover" />
            ) : (
              <RiPlayListLine size={64} className="text-zinc-300 dark:text-zinc-600" />
            )}
          </div>
          <div className="flex flex-1 flex-col justify-end gap-3">
            <div className="text-xs text-zinc-500">歌单</div>
            {isEditing ? (
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Enter") handleRename();
                    if (e.key === "Escape") setIsEditing(false);
                  }}
                  onBlur={() => setIsEditing(false)}
                  className="border-primary w-full border-b-2 bg-transparent text-2xl font-bold outline-none"
                />
              </div>
            ) : (
              <button
                type="button"
                className="hover:text-primary bg-transparent text-2xl font-bold hover:cursor-pointer"
                onClick={handleStartRename}
                title="点击重命名"
              >
                {pl.name}
              </button>
            )}
            {pl.description && <p className="text-sm text-zinc-500">{pl.description}</p>}
            <div className="flex items-center gap-2 text-sm text-zinc-500">
              <span>{pl.songs.length} 首</span>
              <span>·</span>
              <span>创建于 {new Date(pl.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex gap-2">
              <Button
                color="primary"
                startContent={<RiPlayFill size={18} />}
                onPress={handlePlayAll}
                isDisabled={pl.songs.length === 0}
              >
                播放全部
              </Button>
              <Button
                variant="flat"
                startContent={<RiPlayListAddLine size={18} />}
                onPress={handleAddAll}
                isDisabled={pl.songs.length === 0}
              >
                添加到队列
              </Button>
              <Button
                variant="flat"
                startContent={<RiDownload2Line size={18} />}
                onPress={handleDownloadAll}
                isDisabled={pl.songs.length === 0}
              >
                下载全部
              </Button>
              <Button variant="light" color="danger" onPress={handleDelete}>
                删除歌单
              </Button>
            </div>
          </div>
        </div>

        {/* Song list */}
        {pl.songs.length === 0 ? (
          <Empty description="歌单为空，去搜索中添加歌曲吧" />
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext
              items={pl.songs.map(s => `${s.bvid ?? s.sid ?? s.id ?? ""}`)}
              strategy={verticalListSortingStrategy}
            >
              <div className="flex flex-col">
                {pl.songs.map((song, index) => (
                  <DraggableMusicListItem
                    key={`${song.bvid ?? song.sid ?? song.id ?? ""}`}
                    song={song}
                    index={index}
                    menus={pageMenus}
                    onMenuAction={key => handleMenuAction(key, index)}
                    onPress={() => {
                      usePlayList.getState().play(song);
                    }}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </ScrollContainer>
  );
};

export default PlaylistDetailPage;
