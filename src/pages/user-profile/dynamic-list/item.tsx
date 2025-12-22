import React, { useState } from "react";

import { Button, Card, CardBody, CardFooter, CardHeader, Image, Tooltip } from "@heroui/react";
import { RiDownloadLine, RiExternalLinkLine, RiPlayCircleFill, RiThumbUpFill, RiThumbUpLine } from "@remixicon/react";
import moment from "moment";

import type { WebDynamicItem } from "@/service/web-dynamic";

import { formatNumber } from "@/common/utils/number";
import { openBiliVideoLink } from "@/common/utils/url";
import { postDynamicFeedThumb } from "@/service/web-dynamic-feed-thumb";
import { usePlayList } from "@/store/play-list";

interface DynamicItemProps {
  item: WebDynamicItem;
}

const DynamicItem = ({ item }: DynamicItemProps) => {
  const author = item.modules.module_author;
  const dynamic = item.modules.module_dynamic;
  const stat = item.modules.module_stat;
  const archive = dynamic?.major?.archive || dynamic?.major?.ugc_season;
  const opus = dynamic?.major?.opus;
  const [isLike, setIsLike] = useState(() => stat?.like?.status === true);

  const play = usePlayList(s => s.play);

  // Format time
  const timeDisplay = author?.pub_time || moment(author?.pub_ts * 1000).fromNow();

  // Get text content
  const textContent = dynamic?.desc?.text || opus?.summary?.text || "";

  const handlePlay = async () => {
    if (archive) {
      await play({
        bvid: archive.bvid,
        title: archive.title,
        cover: archive.cover,
        ownerName: author?.name || "",
        ownerMid: author?.mid || 0,
        type: "mv",
      });
    }
  };

  const handleThumb = async () => {
    setIsLike(!isLike);
    await postDynamicFeedThumb({
      dyn_id_str: item.id_str,
      up: isLike ? 2 : 1,
    });
  };

  return (
    <Card className="bg-content1 w-full border-none shadow-sm" radius="md">
      {/* Header: Time and Action + More Menu */}
      <CardHeader className="flex items-center justify-between px-4 pt-4 pb-0">
        <div className="text-small text-default-500 flex items-center gap-2">
          <span>{timeDisplay}</span>
        </div>
      </CardHeader>

      <CardBody className="px-4 py-3">
        {/* 动态附带的文本内容 */}
        {Boolean(textContent) && (
          <div className="mb-2 text-base leading-relaxed whitespace-pre-wrap">{textContent}</div>
        )}
        {/* 动态附带的视频内容 */}
        {Boolean(archive) && (
          <div
            className="group bg-default-100 hover:bg-default-200 flex cursor-pointer gap-3 rounded-lg p-3 transition-colors"
            onClick={handlePlay}
          >
            <div className="relative h-24 w-40 shrink-0 overflow-hidden rounded-md">
              <Image
                removeWrapper
                src={archive.cover}
                alt={archive.title}
                className="h-full w-full object-cover"
                radius="none"
              />
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/30 opacity-0 transition-opacity group-hover:opacity-100">
                <RiPlayCircleFill size={32} className="text-white/90" />
              </div>
            </div>
            <div className="flex flex-col justify-between py-1">
              <div className="space-y-2">
                <h3 className="text-default-900 line-clamp-2 text-sm font-medium">{archive.title}</h3>
                <div className="text-default-500 line-clamp-2 text-xs">{archive.desc}</div>
              </div>
              <div className="text-default-500 flex items-center justify-between gap-3 text-xs">
                <div className="text-xs">{archive.duration_text}</div>
                <span className="flex items-center gap-1">
                  <span>{archive.stat.play}</span>
                  <span>播放</span>
                </span>
              </div>
            </div>
          </div>
        )}
      </CardBody>

      {/* Footer: Actions */}
      <CardFooter className="border-default-100 flex items-center justify-between border-t px-2 py-1">
        <Tooltip closeDelay={0} content="打开B站链接">
          <Button
            variant="light"
            size="sm"
            className="text-default-500 data-[hover=true]:bg-default-100 flex-1 gap-1"
            onPress={() => {
              openBiliVideoLink({
                type: "mv",
                bvid: archive.bvid,
              });
            }}
          >
            <RiExternalLinkLine size={18} />
          </Button>
        </Tooltip>
        <Tooltip closeDelay={0} content="下载视频">
          <Button
            variant="light"
            size="sm"
            className="text-default-500 data-[hover=true]:bg-default-100 flex-1 gap-1"
            onPress={() => {
              window.electron.addMediaDownloadTask({
                outputFileType: "video",
                title: archive.title,
                cover: archive.cover,
                bvid: archive.bvid,
              });
            }}
          >
            <RiDownloadLine size={18} />
          </Button>
        </Tooltip>
        <Button
          variant="light"
          size="sm"
          className="text-default-500 data-[hover=true]:bg-default-100 flex-1 gap-1"
          onPress={handleThumb}
        >
          {isLike ? <RiThumbUpFill size={18} /> : <RiThumbUpLine size={18} />}
          <span>{stat?.like?.count ? formatNumber(stat.like.count) : "点赞"}</span>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default DynamicItem;
