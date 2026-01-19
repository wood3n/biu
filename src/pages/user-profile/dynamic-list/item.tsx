import React, { useState } from "react";

import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  User,
} from "@heroui/react";
import { RiExternalLinkLine, RiMoreLine, RiPlayFill, RiThumbUpFill, RiThumbUpLine } from "@remixicon/react";
import moment from "moment";

import type { WebDynamicItem } from "@/service/web-dynamic";

import { formatNumber } from "@/common/utils/number";
import { openBiliVideoLink } from "@/common/utils/url";
import IconButton from "@/components/icon-button";
import Image from "@/components/image";
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
  const [likeCount, setLikeCount] = useState(() => stat?.like?.count || 0);

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
    setLikeCount(prev => prev + (isLike ? -1 : 1));
    await postDynamicFeedThumb({
      dyn_id_str: item.id_str,
      up: isLike ? 2 : 1,
    });
  };

  return (
    <Card className="border-default-100 mb-2 w-full rounded-none border-b bg-transparent pb-4 shadow-none">
      <CardHeader className="flex items-start justify-between px-0 py-2">
        <User
          isFocusable
          avatarProps={{
            src: author.face,
          }}
          description={
            <div className="text-tiny text-default-500 flex items-center gap-1">
              <span>{timeDisplay}</span>
              {author.pub_action && (
                <>
                  <span>·</span>
                  <span>{author.pub_action}</span>
                </>
              )}
            </div>
          }
          name={author.name}
          className="cursor-pointer"
          classNames={{
            name: "hover:underline",
          }}
        />
        <div className="flex items-center">
          <Button
            variant="light"
            size="sm"
            className="text-default-500 data-[hover=true]:bg-default-100 flex-1 gap-1"
            onPress={handleThumb}
          >
            {isLike ? <RiThumbUpFill size={18} /> : <RiThumbUpLine size={18} />}
            <span>{likeCount > 0 ? formatNumber(likeCount) : "点赞"}</span>
          </Button>
          <Dropdown>
            <DropdownTrigger>
              <IconButton>
                <RiMoreLine size={16} />
              </IconButton>
            </DropdownTrigger>
            <DropdownMenu
              aria-label="用户动态操作"
              items={[
                {
                  key: "open",
                  label: "打开B站链接",
                  icon: <RiExternalLinkLine size={18} />,
                  onPress: () => {
                    if (!archive) return;
                    openBiliVideoLink({
                      type: "mv",
                      bvid: archive.bvid,
                    });
                  },
                },
              ]}
            >
              {item => (
                <DropdownItem key={item.key} startContent={item.icon} onPress={item.onPress}>
                  {item.label}
                </DropdownItem>
              )}
            </DropdownMenu>
          </Dropdown>
        </div>
      </CardHeader>

      <CardBody className="group text-small text-default-700 px-0 py-1 whitespace-pre-wrap">
        {Boolean(textContent) && <p className="mb-2 leading-relaxed">{textContent}</p>}
        {Boolean(archive) && (
          <div
            className="group border-default-200 dark:border-default-100 bg-default-50 hover:bg-default-100 relative mt-2 cursor-pointer overflow-hidden rounded-xl border"
            onClick={handlePlay}
          >
            <div className="flex flex-row">
              <div className="relative h-32 w-48 shrink-0">
                <Image
                  params="472w_264h_1c_!web-dynamic.webp"
                  removeWrapper
                  radius="none"
                  src={archive.cover}
                  alt={archive.title}
                  className="h-full w-full object-cover"
                  classNames={{
                    wrapper: "w-full h-full",
                    img: "w-full h-full",
                  }}
                />
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-[rgba(0,0,0,0.4)] opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                  <RiPlayFill size={32} className="text-white" />
                </div>
                <div className="absolute right-1 bottom-1 z-20 rounded bg-black/70 px-1 text-xs text-white">
                  {archive.duration_text || ""}
                </div>
              </div>
              <div className="flex min-w-0 grow flex-col justify-between p-3">
                <div className="space-y-1">
                  <h3 className="line-clamp-2 text-sm font-medium" title={archive.title || ""}>
                    {archive.title || ""}
                  </h3>
                  <div className="text-default-500 line-clamp-1 text-xs">{archive.desc || ""}</div>
                </div>
                <span className="text-default-400 mt-1 text-xs">{archive.stat?.play || 0}观看</span>
              </div>
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default DynamicItem;
