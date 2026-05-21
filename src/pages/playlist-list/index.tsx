import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { useNavigate } from "react-router";

import { DndContext, type DragEndEvent, closestCenter, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, rectSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { addToast, Button, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@heroui/react";
import { RiAddLine, RiPlayFill, RiPlayListLine } from "@remixicon/react";

import Empty from "@/components/empty";
import ScrollContainer from "@/components/scroll-container";
import { usePlayList } from "@/store/play-list";
import { useUserPlaylistStore } from "@/store/user-playlist";

const SortablePlaylistCard = ({
  id,
  name,
  songCount,
  cover,
  onPlay,
}: {
  id: string;
  name: string;
  songCount: number;
  cover?: string;
  onPlay: (e: React.MouseEvent) => void;
}) => {
  const navigate = useNavigate();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style: CSSProperties = useMemo(
    () => ({
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
      touchAction: "none",
      cursor: "grab",
    }),
    [transform, transition, isDragging],
  );

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => navigate(`/playlists/${id}`)}
      className="group relative"
    >
      <div className="relative aspect-square overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800">
        {songCount > 0 && cover ? (
          <img src={cover} alt="" className="h-full w-full object-cover" />
        ) : songCount > 0 ? (
          <div className="grid h-full grid-cols-2 grid-rows-2 gap-0.5 p-0.5">
            <div className="flex items-center justify-center bg-zinc-200 dark:bg-zinc-700">
              <RiPlayListLine size={24} className="text-zinc-400" />
            </div>
            <div className="flex items-center justify-center bg-zinc-200 dark:bg-zinc-700">
              <RiPlayListLine size={24} className="text-zinc-400" />
            </div>
            <div className="flex items-center justify-center bg-zinc-200 dark:bg-zinc-700">
              <RiPlayListLine size={24} className="text-zinc-400" />
            </div>
            <div className="flex items-center justify-center bg-zinc-200 dark:bg-zinc-700">
              <RiPlayListLine size={24} className="text-zinc-400" />
            </div>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center">
            <RiPlayListLine size={48} className="text-zinc-300 dark:text-zinc-600" />
          </div>
        )}
        <div
          role="button"
          tabIndex={0}
          onClick={e => {
            e.stopPropagation();
            onPlay(e);
          }}
          onKeyDown={e => {
            if (e.key === "Enter") {
              e.stopPropagation();
              onPlay(e as unknown as React.MouseEvent);
            }
          }}
          className="bg-primary absolute right-2 bottom-2 hidden h-10 w-10 items-center justify-center rounded-full text-white shadow-lg transition-transform group-hover:flex hover:scale-105"
        >
          <RiPlayFill size={20} />
        </div>
      </div>
      <div className="mt-2">
        <div className="truncate text-sm font-medium">{name}</div>
        <div className="text-xs text-zinc-500">{songCount} 首</div>
      </div>
    </div>
  );
};

const PlaylistListPage = () => {
  const playlists = useUserPlaylistStore(s => s.playlists);
  const createPlaylist = useUserPlaylistStore(s => s.createPlaylist);
  const reorderPlaylists = useUserPlaylistStore(s => s.reorderPlaylists);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const createInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isCreateOpen) createInputRef.current?.focus();
  }, [isCreateOpen]);

  const navigate = useNavigate();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  );

  const handleCreate = () => {
    if (!newName.trim()) return;
    const id = createPlaylist(newName);
    setNewName("");
    setIsCreateOpen(false);
    addToast({ title: "歌单已创建", color: "success" });
    navigate(`/playlists/${id}`);
  };

  const handlePlay = (e: React.MouseEvent, pl: (typeof playlists)[0]) => {
    e.stopPropagation();
    if (pl.songs.length === 0) {
      addToast({ title: "歌单为空", color: "warning" });
      return;
    }
    usePlayList.getState().playList(pl.songs);
    addToast({ title: `正在播放「${pl.name}」`, color: "success" });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = playlists.findIndex(p => p.id === active.id);
    const newIndex = playlists.findIndex(p => p.id === over.id);
    if (oldIndex !== -1 && newIndex !== -1) {
      reorderPlaylists(oldIndex, newIndex);
    }
  };

  return (
    <ScrollContainer>
      <div className="mx-auto flex max-w-[1200px] flex-col gap-6 p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">我的歌单</h1>
          <Button color="primary" startContent={<RiAddLine size={18} />} onPress={() => setIsCreateOpen(true)}>
            新建歌单
          </Button>
        </div>

        {playlists.length === 0 ? (
          <Empty description="还没有歌单，点击上方按钮创建" />
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={playlists.map(p => p.id)} strategy={rectSortingStrategy}>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {playlists.map(pl => (
                  <SortablePlaylistCard
                    key={pl.id}
                    id={pl.id}
                    name={pl.name}
                    songCount={pl.songs.length}
                    cover={pl.songs[0]?.cover}
                    onPlay={e => handlePlay(e, pl)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      <Modal
        disableAnimation
        hideCloseButton
        backdrop="opaque"
        isOpen={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        size="sm"
        radius="md"
        classNames={{ backdrop: "z-200", wrapper: "z-200" }}
      >
        <ModalContent>
          <ModalHeader className="text-base font-medium">新建歌单</ModalHeader>
          <ModalBody>
            <Input
              ref={createInputRef}
              placeholder="输入歌单名称"
              value={newName}
              onValueChange={setNewName}
              onKeyDown={e => {
                if (e.key === "Enter") handleCreate();
              }}
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={() => setIsCreateOpen(false)}>
              取消
            </Button>
            <Button color="primary" onPress={handleCreate} isDisabled={!newName.trim()}>
              创建
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </ScrollContainer>
  );
};

export default PlaylistListPage;
