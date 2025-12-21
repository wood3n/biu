import React from "react";
import { useNavigate } from "react-router";

import { Image, Card, CardHeader, CardBody, addToast, User } from "@heroui/react";
import moment from "moment";

import { usePlayList } from "@/store/play-list";

import type { WebDynamicItem } from "../../service/web-dynamic";

import MoreMenu from "./more-menu";

interface DynamicItemProps {
  item: WebDynamicItem;
  onClose: () => void;
}

const DynamicItem: React.FC<DynamicItemProps> = ({ item, onClose }) => {
  const author = item.modules.module_author;
  const dynamic = item.modules.module_dynamic;
  const archive = dynamic.major?.archive;
  const play = usePlayList(s => s.play);
  const addToNext = usePlayList(s => s.addToNext);
  const navigate = useNavigate();

  // Format time
  const timeDisplay = author.pub_time || moment(author.pub_ts * 1000).fromNow();

  // Get text content
  const textContent = dynamic.desc?.text || dynamic.major?.opus?.summary?.text || "";

  const handleDownload = async (type: "audio" | "video") => {
    await window.electron.addMediaDownloadTask({
      outputFileType: type,
      title: archive?.title as string,
      cover: archive?.cover,
      bvid: archive?.bvid,
    });
    addToast({
      title: "已添加到下载队列",
      color: "success",
    });
  };

  return (
    <Card className="border-default-100 mb-2 w-full rounded-none border-b bg-transparent pb-4 shadow-none">
      <CardHeader className="flex items-start justify-between px-0 pt-4 pb-2">
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
          onClick={() => {
            navigate(`/user/${author.mid}`);
            onClose();
          }}
        />
        <MoreMenu
          onAddToNext={() => {
            if (archive) {
              addToNext({
                type: "mv",
                bvid: archive.bvid,
                title: archive.title,
                cover: archive.cover,
                ownerName: author.name,
                ownerMid: author.mid,
              });
              addToast({
                title: "已添加到下一首播放",
                color: "success",
              });
            }
          }}
          onDownloadAudio={() => handleDownload("audio")}
          onDownloadVideo={() => handleDownload("video")}
        />
      </CardHeader>

      <CardBody className="text-small text-default-700 px-0 py-1 whitespace-pre-wrap">
        {Boolean(textContent) && <p className="mb-2 leading-relaxed">{textContent}</p>}
        <div
          className="group border-default-200 dark:border-default-100 bg-default-50 hover:bg-default-100 relative mt-2 cursor-pointer overflow-hidden rounded-xl border"
          onClick={async () => {
            await play({
              bvid: archive?.bvid || "",
              title: archive?.title || "",
              cover: archive?.cover || "",
              ownerName: author?.name || "",
              ownerMid: author?.mid || 0,
              type: "mv",
            });
            onClose();
          }}
        >
          <div className="flex flex-row">
            <div className="relative h-32 w-48 shrink-0">
              <Image
                removeWrapper
                radius="none"
                src={archive?.cover || ""}
                alt={archive?.title || ""}
                className="h-full w-full object-cover"
                classNames={{
                  wrapper: "w-full h-full",
                  img: "w-full h-full",
                }}
              />
              <div className="absolute right-1 bottom-1 rounded bg-black/70 px-1 text-xs text-white">
                {archive?.duration_text || ""}
              </div>
            </div>
            <div className="flex min-w-0 grow flex-col justify-between p-3">
              <div className="space-y-1">
                <h3 className="line-clamp-2 text-sm font-medium" title={archive?.title || ""}>
                  {archive?.title || ""}
                </h3>
                <div className="text-default-500 line-clamp-1 text-xs">{archive?.desc || ""}</div>
              </div>
              <span className="text-default-400 mt-1 text-xs">{archive?.stat?.play || 0}观看</span>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default DynamicItem;
