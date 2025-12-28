import React, { useState, useMemo } from "react";

import { addToast, Button, Image, Tooltip } from "@heroui/react";
import {
  RiDownloadLine,
  RiExternalLinkLine,
  RiPlayCircleFill,
  RiThumbUpFill,
  RiThumbUpLine,
  RiYoutubeLine,
} from "@remixicon/react";
import moment from "moment";

import type { WebDynamicItem } from "@/service/web-dynamic";

import { formatNumber } from "@/common/utils/number";
import { openBiliVideoLink } from "@/common/utils/url";
import { postDynamicFeedThumb } from "@/service/web-dynamic-feed-thumb";
import { usePlayList } from "@/store/play-list";

interface DynamicItemProps {
  item: WebDynamicItem;
}

// 格式化播放量显示
const formatPlayCount = (playStr: string | null | undefined): string => {
  if (!playStr) return "0";
  // 如果字符串已经包含"万"、"亿"等格式化字符，直接显示
  if (/[万亿]/.test(playStr)) {
    return playStr;
  }
  // 否则尝试解析为数字并格式化
  const playNum = Number(playStr);
  if (isNaN(playNum)) return playStr;
  const formatted = formatNumber(playNum);
  return typeof formatted === "string" ? formatted : String(formatted ?? playStr);
};

const DynamicItem = ({ item }: DynamicItemProps) => {
  const author = item.modules.module_author;
  const dynamic = item.modules.module_dynamic;
  const stat = item.modules.module_stat;
  const archive = dynamic?.major?.archive || dynamic?.major?.ugc_season;
  const opus = dynamic?.major?.opus;
  const [isLike, setIsLike] = useState(() => stat?.like?.status === true);

  const play = usePlayList(s => s.play);

  // 使用 useMemo 优化时间格式化
  const timeDisplay = useMemo(() => {
    return author?.pub_time || (author?.pub_ts ? moment(author.pub_ts * 1000).fromNow() : "");
  }, [author?.pub_time, author?.pub_ts]);

  // 使用 useMemo 优化文本内容提取
  const textContent = useMemo(() => {
    return dynamic?.desc?.text || opus?.summary?.text || "";
  }, [dynamic?.desc?.text, opus?.summary?.text]);

  // 使用 useMemo 优化播放量格式化
  const playCountDisplay = useMemo(() => {
    return formatPlayCount(archive?.stat?.play);
  }, [archive?.stat?.play]);

  const handleThumb = async () => {
    setIsLike(!isLike);
    await postDynamicFeedThumb({
      dyn_id_str: item.id_str,
      up: isLike ? 2 : 1,
    });
  };

  const handleDoubleClick = () => {
    if (archive) {
      play({
        type: "mv",
        bvid: archive.bvid,
        title: archive.title,
        cover: archive.cover,
        ownerName: author?.name || "",
        ownerMid: author?.mid || 0,
      });
    }
  };

  return (
    <div
      className="border-default-100 hover:bg-default-50 dark:hover:bg-default-100 group relative flex w-full gap-4 border-b px-4 py-3 transition-colors"
      onDoubleClick={handleDoubleClick}
    >
      {/* 视频缩略图 */}
      {archive && (
        <div className="relative h-20 w-36 shrink-0 overflow-hidden rounded">
          <Image
            removeWrapper
            src={archive.cover}
            alt={archive.title}
            className="h-full w-full object-cover"
            radius="none"
          />
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/20 opacity-0 transition-opacity group-hover:opacity-100">
            <RiPlayCircleFill size={24} className="text-white/90" />
          </div>
          {archive.duration_text && (
            <div className="absolute right-1 bottom-1 rounded bg-black/80 px-1.5 text-xs text-white">
              {archive.duration_text}
            </div>
          )}
        </div>
      )}

      {/* 内容区域 */}
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        {/* 时间和文本内容 */}
        <div className="flex items-start gap-2">
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            {Boolean(textContent) && (
              <div className="text-default-700 line-clamp-2 text-sm leading-relaxed">{textContent}</div>
            )}
            {archive && (
              <div className="text-default-900 line-clamp-1 text-left text-base font-medium">{archive.title}</div>
            )}
          </div>
          <div className="text-default-400 w-[80px] shrink-0 text-right text-xs whitespace-nowrap">{timeDisplay}</div>
        </div>

        {/* 视频信息和操作按钮 */}
        {archive && (
          <div className="mt-auto flex items-center gap-2">
            <div className="text-default-500 flex flex-1 items-center gap-1 text-sm">
              <RiYoutubeLine size={16} className="text-default-400" />
              <span>{playCountDisplay}</span>
            </div>
            {/* 操作按钮 - 放在右边底部，与时间对齐 */}
            <div className="flex min-w-[80px] shrink-0 items-center justify-end gap-1">
              <Tooltip closeDelay={0} content="打开B站链接">
                <Button
                  variant="light"
                  size="sm"
                  isIconOnly
                  className="text-default-400 data-[hover=true]:bg-default-100 h-8 min-w-8"
                  onPress={() => {
                    openBiliVideoLink({
                      type: "mv",
                      bvid: archive.bvid,
                    });
                  }}
                >
                  <RiExternalLinkLine size={16} />
                </Button>
              </Tooltip>
              <Tooltip closeDelay={0} content="下载视频">
                <Button
                  variant="light"
                  size="sm"
                  isIconOnly
                  className="text-default-400 data-[hover=true]:bg-default-100 h-8 min-w-8"
                  onPress={async () => {
                    await window.electron.addMediaDownloadTask({
                      outputFileType: "video",
                      title: archive.title,
                      cover: archive.cover,
                      bvid: archive.bvid,
                    });
                    addToast({
                      title: "已添加下载任务",
                      color: "success",
                    });
                  }}
                >
                  <RiDownloadLine size={16} />
                </Button>
              </Tooltip>
              <Tooltip closeDelay={0} content={stat?.like?.count ? `点赞数: ${formatNumber(stat.like.count)}` : "点赞"}>
                <Button
                  variant="light"
                  size="sm"
                  isIconOnly
                  className="text-default-400 data-[hover=true]:bg-default-100 h-8 min-w-8"
                  onPress={handleThumb}
                >
                  {isLike ? <RiThumbUpFill size={16} /> : <RiThumbUpLine size={16} />}
                </Button>
              </Tooltip>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DynamicItem;
