import { useCallback, useMemo, useRef, useState } from "react";

import { addToast, Input } from "@heroui/react";
import { RiCloseLine, RiDeleteBinLine, RiFocus3Line, RiSearchLine } from "@remixicon/react";
import { uniqBy } from "es-toolkit/array";
import { twMerge } from "tailwind-merge";

import { openBiliVideoLink } from "@/common/utils/url";
import { type ScrollRefObject } from "@/components/scroll-container";
import { VirtualList } from "@/components/virtual-list";
import { useModalStore } from "@/store/modal";
import { isSame, usePlayList, type PlayData } from "@/store/play-list";
import { useUser } from "@/store/user";

import Empty from "../empty";
import IconButton from "../icon-button";
import PlayListItem from "./play-list-item";

const RowHeight = 72;

interface Props {
  className?: string;
  style?: React.CSSProperties;
  onClose?: () => void;
}

const FullScreenPlayList = ({
  ref,
  className,
  style,
  onClose,
}: Props & { ref?: React.RefObject<HTMLDivElement | null> }) => {
  const scrollRef = useRef<ScrollRefObject | null>(null);
  const list = usePlayList(s => s.list);
  const playId = usePlayList(s => s.playId);
  const clear = usePlayList(s => s.clear);
  const user = useUser(s => s.user);
  const playListItem = usePlayList(state => state.playListItem);
  const [searchKeyword, setSearchKeyword] = useState("");

  const playItem = useMemo(() => list.find(item => item.id === playId), [list, playId]);
  const pureList = useMemo(() => {
    return uniqBy(list, item =>
      item.source === "local" ? `local:${item.id}` : item.type === "mv" ? `mv:${item.bvid}` : `audio:${item.sid}`,
    );
  }, [list]);

  const filteredList = useMemo(() => {
    if (!searchKeyword) return pureList;
    const lowerKeyword = searchKeyword.toLowerCase();
    return pureList.filter(item => {
      const title = item.title || "";
      const ownerName = item.ownerName || "";
      return title.toLowerCase().includes(lowerKeyword) || ownerName.toLowerCase().includes(lowerKeyword);
    });
  }, [pureList, searchKeyword]);

  const handleAction = useCallback(async (key: string, item: PlayData) => {
    switch (key) {
      case "favorite":
        useModalStore.getState().onOpenFavSelectModal({
          rid: item.id,
          type: item.type === "mv" ? 2 : 12,
          title: item.title,
        });
        break;
      case "download-audio":
        await window.electron.addMediaDownloadTask({
          outputFileType: "audio",
          title: item.title,
          cover: item.cover,
          bvid: item.bvid,
          sid: item.type === "audio" ? item.id : undefined,
        });
        addToast({ title: "已添加下载任务", color: "success" });
        break;
      case "download-video":
        await window.electron.addMediaDownloadTask({
          outputFileType: "video",
          title: item.title,
          cover: item.cover,
          bvid: item.bvid,
        });
        addToast({ title: "已添加下载任务", color: "success" });
        break;
      case "bililink":
        openBiliVideoLink(item);
        break;
      case "del":
        usePlayList.getState().del(item.id);
        break;
      default:
        break;
    }
  }, []);

  const scrollToPlayItem = useCallback(() => {
    if (!playItem) {
      addToast({ title: "当前没有正在播放的歌曲", color: "warning" });
      return;
    }

    const targetIndex =
      playItem?.source === "local"
        ? filteredList.findIndex(item => item.id === playItem.id)
        : filteredList.findIndex(item => isSame(playItem, item));
    if (targetIndex < 0) {
      addToast({ title: "未在列表中找到当前播放的歌曲", color: "warning" });
      return;
    }

    const viewport = scrollRef.current?.osInstance()?.elements().viewport as HTMLElement | null;
    if (!viewport) return;

    const targetTop = targetIndex * RowHeight;
    const maxTop = Math.max(0, viewport.scrollHeight - viewport.clientHeight);
    const nextTop = Math.min(targetTop, maxTop);

    if (typeof viewport.scrollTo === "function") {
      viewport.scrollTo({ top: nextTop, behavior: "smooth" });
    } else {
      viewport.scrollTop = nextTop;
    }
  }, [playItem, filteredList]);

  return (
    <div
      ref={ref}
      className={twMerge(
        "flex flex-col overflow-hidden rounded-2xl bg-white/10 text-white ring-1 ring-white/12 backdrop-blur-md",
        className,
      )}
      style={style}
    >
      <div className="flex w-full flex-none flex-row items-center justify-between space-x-1 border-b border-white/10 px-2 py-2">
        <Input
          classNames={{
            mainWrapper: "h-full",
            input: "text-sm",
            inputWrapper: "bg-black/20 hover:bg-black/30 group-data-[focus=true]:bg-black/30",
          }}
          placeholder="搜索播放列表"
          size="sm"
          startContent={<RiSearchLine size={16} />}
          type="search"
          value={searchKeyword}
          onValueChange={setSearchKeyword}
        />
        <div className="flex items-center">
          <IconButton tooltip="定位当前播放" onPress={scrollToPlayItem} className="text-white/80">
            <RiFocus3Line size={16} />
          </IconButton>
          <IconButton tooltip="清空播放列表" onPress={clear} className="hover:text-danger text-white/80">
            <RiDeleteBinLine size={16} />
          </IconButton>
          <IconButton tooltip="关闭" onPress={onClose} className="hover:text-danger text-white/80">
            <RiCloseLine size={22} />
          </IconButton>
        </div>
      </div>
      {filteredList.length ? (
        <VirtualList
          className="h-full w-full flex-1 px-2 pb-2"
          scrollRef={scrollRef}
          data={filteredList}
          itemHeight={RowHeight}
          renderItem={item => (
            <PlayListItem
              data={item}
              isLogin={Boolean(user?.isLogin)}
              isPlaying={playItem?.source === "local" ? playItem?.id === item.id : isSame(playItem, item)}
              onClose={() => onClose?.()}
              onPress={() => playListItem(item.id)}
              onAction={key => handleAction(key, item)}
            />
          )}
        />
      ) : (
        <div className="flex flex-1 items-center justify-center">
          <Empty />
        </div>
      )}
    </div>
  );
};

export default FullScreenPlayList;
