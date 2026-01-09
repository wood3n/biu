import React, { useCallback, useMemo } from "react";

import { addToast, Button, Drawer, DrawerBody, DrawerContent, DrawerHeader, Tooltip } from "@heroui/react";
import { RiDeleteBinLine } from "@remixicon/react";
import { uniqBy } from "es-toolkit/array";

import { openBiliVideoLink } from "@/common/utils/url";
import { VirtualList } from "@/components/virtual-list";
import { useModalStore } from "@/store/modal";
import { usePlayList, type PlayData } from "@/store/play-list";
import { useUser } from "@/store/user";

import Empty from "../empty";
import ListItem from "./list-item";
// Settings removed: now controlled via MusicPlayMode popover

const PlayListDrawer = () => {
  const isOpen = useModalStore(s => s.isPlayListDrawerOpen);
  const setOpen = useModalStore(s => s.setPlayListDrawerOpen);
  const list = usePlayList(s => s.list);
  const playId = usePlayList(s => s.playId);
  const clear = usePlayList(s => s.clear);
  const user = useUser(s => s.user);
  const playListItem = usePlayList(state => state.playListItem);

  const playItem = useMemo(() => list.find(item => item.id === playId), [list, playId]);
  const pureList = useMemo(() => {
    return uniqBy(list, item => item.bvid);
  }, [list]);
  const currentMedia = useMemo(() => pureList.find(item => item.bvid === playItem?.bvid), [pureList, playItem]);
  const filteredList = useMemo(() => {
    return pureList.filter(item => item.bvid !== playItem?.bvid);
  }, [pureList, playItem]);

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

  return (
    <Drawer
      radius="md"
      shadow="lg"
      backdrop="transparent"
      size="sm"
      hideCloseButton
      disableAnimation
      isOpen={isOpen}
      onOpenChange={setOpen}
      classNames={{
        backdrop: "z-200 window-no-drag",
        wrapper: "z-200",
        base: "data-[placement=right]:mb-22",
      }}
    >
      <DrawerContent>
        <DrawerHeader className="border-divider/40 flex flex-row items-center justify-between space-x-2 border-b px-4 py-3">
          <h3>播放列表</h3>
          {Boolean(pureList?.length) && (
            <Tooltip closeDelay={0} content="清空播放列表">
              <Button isIconOnly size="sm" variant="light" onPress={clear}>
                <RiDeleteBinLine size={16} />
              </Button>
            </Tooltip>
          )}
        </DrawerHeader>
        {list.length ? (
          <>
            {Boolean(currentMedia) && (
              <div className="border-divider/40 border-b px-2 py-1">
                <ListItem
                  isLogin={Boolean(user?.isLogin)}
                  isPlaying
                  data={currentMedia!}
                  onClose={() => setOpen(false)}
                  onAction={key => handleAction(key, currentMedia!)}
                />
              </div>
            )}
            <DrawerBody className="overflow-hidden px-0">
              <VirtualList
                className="h-full w-full px-2"
                data={filteredList}
                itemHeight={64}
                renderItem={item => (
                  <ListItem
                    data={item}
                    isLogin={Boolean(user?.isLogin)}
                    onClose={() => setOpen(false)}
                    onPress={() => playListItem(item.id)}
                    onAction={key => handleAction(key, item)}
                  />
                )}
              />
            </DrawerBody>
          </>
        ) : (
          <Empty />
        )}
      </DrawerContent>
    </Drawer>
  );
};

export default PlayListDrawer;
