import React, { useCallback, useMemo, useRef } from "react";

import { addToast, Drawer, DrawerBody, DrawerContent, DrawerHeader } from "@heroui/react";
import { RiDeleteBinLine, RiFocus3Line } from "@remixicon/react";
import { uniqBy } from "es-toolkit/array";

import { openBiliVideoLink } from "@/common/utils/url";
import { type ScrollRefObject } from "@/components/scroll-container";
import { VirtualList } from "@/components/virtual-list";
import { useModalStore } from "@/store/modal";
import { isSame, usePlayList, type PlayData } from "@/store/play-list";
import { useUser } from "@/store/user";

import Empty from "../empty";
import IconButton from "../icon-button";
import ListItem from "./list-item";

const RowHeight = 64;

const PlayListDrawer = () => {
  const scrollRef = useRef<ScrollRefObject | null>(null);
  const isOpen = useModalStore(s => s.isPlayListDrawerOpen);
  const setOpen = useModalStore(s => s.setPlayListDrawerOpen);
  const list = usePlayList(s => s.list);
  const playId = usePlayList(s => s.playId);
  const clear = usePlayList(s => s.clear);
  const user = useUser(s => s.user);
  const playListItem = usePlayList(state => state.playListItem);

  const playItem = useMemo(() => list.find(item => item.id === playId), [list, playId]);
  const pureList = useMemo(() => {
    return uniqBy(list, item =>
      item.source === "local" ? `local:${item.id}` : item.type === "mv" ? `mv:${item.bvid}` : `audio:${item.sid}`,
    );
  }, [list]);

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
        addToast({
          title: "已添加下载任务",
          color: "success",
        });
        break;
      case "download-video":
        await window.electron.addMediaDownloadTask({
          outputFileType: "video",
          title: item.title,
          cover: item.cover,
          bvid: item.bvid,
        });
        addToast({
          title: "已添加下载任务",
          color: "success",
        });
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
        ? pureList.findIndex(item => item.id === playItem.id)
        : pureList.findIndex(item => isSame(playItem, item));
    if (targetIndex < 0) {
      addToast({ title: "未在列表中找到当前播放的歌曲", color: "warning" });
      return;
    }

    const viewport = scrollRef.current?.osInstance()?.elements().viewport as HTMLElement | null;
    if (!viewport) {
      return;
    }

    const targetTop = targetIndex * RowHeight;
    const maxTop = Math.max(0, viewport.scrollHeight - viewport.clientHeight);
    const nextTop = Math.min(targetTop, maxTop);

    if (typeof viewport.scrollTo === "function") {
      viewport.scrollTo({ top: nextTop, behavior: "smooth" });
    } else {
      viewport.scrollTop = nextTop;
    }
  }, [playItem, pureList]);

  return (
    <Drawer
      radius="md"
      shadow="md"
      backdrop="transparent"
      size="sm"
      hideCloseButton
      disableAnimation
      isOpen={isOpen}
      onOpenChange={setOpen}
      classNames={{
        backdrop: "z-200 window-no-drag",
        wrapper: "z-200 window-no-drag",
        base: "data-[placement=right]:mb-22",
      }}
    >
      <DrawerContent>
        <DrawerHeader className="border-divider/40 flex flex-row items-center justify-between space-x-2 border-b px-4 py-3">
          <h3>播放列表</h3>
          <div className="flex items-center">
            {Boolean(pureList?.length) && (
              <>
                <IconButton tooltip="定位当前播放" onPress={scrollToPlayItem}>
                  <RiFocus3Line size={16} />
                </IconButton>
                <IconButton tooltip="清空播放列表" onPress={clear} className="hover:text-danger">
                  <RiDeleteBinLine size={16} />
                </IconButton>
              </>
            )}
          </div>
        </DrawerHeader>
        {list.length ? (
          <DrawerBody className="overflow-hidden px-0">
            <VirtualList
              className="h-full w-full px-2"
              scrollRef={scrollRef}
              data={pureList}
              itemHeight={RowHeight}
              renderItem={item => (
                <ListItem
                  data={item}
                  isLogin={Boolean(user?.isLogin)}
                  isPlaying={playItem?.source === "local" ? playItem?.id === item.id : isSame(playItem, item)}
                  onClose={() => setOpen(false)}
                  onPress={() => playListItem(item.id)}
                  onAction={key => handleAction(key, item)}
                />
              )}
            />
          </DrawerBody>
        ) : (
          <Empty />
        )}
      </DrawerContent>
    </Drawer>
  );
};

export default PlayListDrawer;
