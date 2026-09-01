import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { addToast, Spinner } from "@heroui/react";
import { RiChat3Line, RiThumbUpLine } from "@remixicon/react";
import clx from "classnames";

import { formatRelativeTime } from "@/common/utils/time";
import Image from "@/components/image";
import { getReplyReply, type ReplyContent, type ReplyItem } from "@/service/reply-main";

interface Props {
  data: ReplyItem;
  className?: string;
}

/** 表情/文本混合分段 */
type Segment = { type: "text"; text: string } | { type: "emote"; text: string; url: string; size: number };

/**
 * 把评论正文切成 文本/表情 分段（emote 的 key 是占位文本，需按长度降序匹配防止部分命中）
 */
const parseSegments = (message: string, emote?: ReplyContent["emote"]): Segment[] => {
  if (!emote || !Object.keys(emote).length) return [{ type: "text", text: message }];
  const keys = Object.keys(emote)
    .sort((a, b) => b.length - a.length)
    .map(k => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  return message
    .split(new RegExp(`(${keys.join("|")})`, "g"))
    .filter(Boolean)
    .map(seg =>
      emote[seg]
        ? { type: "emote" as const, text: seg, url: emote[seg].url, size: emote[seg].meta.size }
        : { type: "text" as const, text: seg },
    );
};

/** 楼中楼单条（头像 20px，缩进紧凑） */
const SubReplyItem = ({ data }: { data: ReplyItem }) => {
  const segments = useMemo(() => parseSegments(data.content.message, data.content.emote), [data.content]);
  return (
    <div className="flex w-full gap-2 py-1.5">
      <Image
        removeWrapper
        radius="full"
        src={data.member.avatar}
        alt={data.member.uname}
        width={20}
        height={20}
        params="48w_48h_1c.avif"
        className="mt-0.5 size-5 flex-none"
      />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <span className="truncate text-xs text-neutral-500 select-none">{data.member.uname}</span>
          <span className="ml-auto flex-none text-xs text-neutral-400 select-none">
            {formatRelativeTime(data.ctime * 1000)}
          </span>
        </div>
        <p className="text-xs leading-relaxed break-words text-neutral-700">
          {segments.map((seg, i) =>
            seg.type === "emote" ? (
              <img
                key={i}
                src={seg.url}
                alt={seg.text}
                loading="lazy"
                className={clx("inline-block align-[-0.25em]", seg.size === 2 ? "size-10" : "size-5")}
              />
            ) : (
              <span key={i}>{seg.text}</span>
            ),
          )}
        </p>
      </div>
    </div>
  );
};

const CommentItem = ({ data, className }: Props) => {
  const segments = useMemo(() => parseSegments(data.content.message, data.content.emote), [data.content]);

  const oid = data.oid;
  const totalReplies = data.rcount || data.count || 0;
  const previewReplies = data.replies ?? [];

  const [isExpanded, setIsExpanded] = useState(false);
  const [subReplies, setSubReplies] = useState<ReplyItem[]>(previewReplies);
  /** 楼中楼页码（首页预览已含第 1 页前几条，从第 2 页继续拉） */
  const pageRef = useRef(1);
  const [loadingMore, setLoadingMore] = useState(false);

  /** 预览数据变化时同步（切歌重载后 items 全量替换） */
  useEffect(() => {
    setSubReplies(previewReplies);
    setIsExpanded(false);
    pageRef.current = 1;
  }, [data.rpid_str]); // eslint-disable-line react-hooks/exhaustive-deps

  /** 展开时若预览为空，先拉第一页 */
  const handleToggle = useCallback(async () => {
    if (isExpanded) {
      setIsExpanded(false);
      return;
    }
    setIsExpanded(true);
    if (!subReplies.length && totalReplies > 0) {
      pageRef.current = 1;
      setLoadingMore(true);
      try {
        const res = await getReplyReply({ oid, type: 1, root: Number(data.rpid_str), ps: 10, pn: 1 });
        if (res.code !== 0) throw new Error(res.message || "获取回复失败");
        setSubReplies(res.data.replies ?? []);
        pageRef.current = 2;
      } catch (error: any) {
        addToast({ title: error?.message || "获取回复失败", color: "danger" });
      } finally {
        setLoadingMore(false);
      }
    }
  }, [isExpanded, subReplies.length, totalReplies, oid, data.rpid_str]);

  /** 加载下一页楼中楼 */
  const handleLoadMore = useCallback(async () => {
    if (loadingMore) return;
    setLoadingMore(true);
    try {
      const res = await getReplyReply({ oid, type: 1, root: Number(data.rpid_str), ps: 10, pn: pageRef.current });
      if (res.code !== 0) throw new Error(res.message || "获取回复失败");
      setSubReplies(prev => [...prev, ...(res.data.replies ?? [])]);
      pageRef.current += 1;
    } catch (error: any) {
      addToast({ title: error?.message || "获取回复失败", color: "danger" });
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, oid, data.rpid_str]);

  const hasSubReplies = totalReplies > 0;

  return (
    <div className={clx("flex w-full gap-3 px-4 py-3", className)}>
      <Image
        removeWrapper
        radius="full"
        src={data.member.avatar}
        alt={data.member.uname}
        width={36}
        height={36}
        params="96w_96h_1c.avif"
        className="flex-none"
      />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        {/* 昵称 + 等级 + 相对时间 */}
        <div className="flex items-center gap-2">
          <span className="max-w-40 truncate text-sm text-neutral-900 select-none">{data.member.uname}</span>
          {data.up_action?.like && <span className="bg-primary/80 rounded-sm px-1 text-[10px] text-white">UP主赞</span>}
          <span className="ml-auto flex-none text-xs text-neutral-400 select-none">
            {formatRelativeTime(data.ctime * 1000)}
          </span>
        </div>
        {/* 正文（含表情） */}
        <p className="text-sm leading-relaxed break-words text-neutral-800">
          {segments.map((seg, i) =>
            seg.type === "emote" ? (
              <img
                key={i}
                src={seg.url}
                alt={seg.text}
                loading="lazy"
                className={clx("inline-block flex-none align-[-0.25em]", seg.size === 2 ? "size-12" : "size-6")}
              />
            ) : (
              <span key={i}>{seg.text}</span>
            ),
          )}
        </p>
        {/* 图片评论 */}
        {Boolean(data.content.pictures?.length) && (
          <div className="flex flex-wrap gap-2">
            {data.content.pictures!.map(pic => (
              <Image
                key={pic.img_src}
                removeWrapper
                radius="md"
                src={pic.img_src}
                alt="评论图片"
                params="240w_240h_1c.avif"
                className="size-24 flex-none object-cover"
              />
            ))}
          </div>
        )}
        {/* 点赞 + 回复数 */}
        <div className="flex items-center gap-4 text-xs text-neutral-500 select-none">
          <span className="flex items-center gap-1">
            <RiThumbUpLine size={14} />
            {data.like || "点赞"}
          </span>
          {hasSubReplies && (
            <span
              className="flex cursor-pointer items-center gap-1 transition-colors hover:text-neutral-800"
              onClick={handleToggle}
            >
              <RiChat3Line size={14} />
              {isExpanded ? "收起回复" : `${totalReplies}条回复`}
            </span>
          )}
        </div>
        {/* 楼中楼 */}
        {isExpanded && (
          <div className="mt-1 flex flex-col rounded-lg bg-neutral-100 px-3 py-1.5">
            {subReplies.map(reply => (
              <SubReplyItem key={reply.rpid_str} data={reply} />
            ))}
            {loadingMore && (
              <div className="flex justify-center py-2">
                <Spinner size="sm" />
              </div>
            )}
            {!loadingMore && subReplies.length < totalReplies && (
              <span
                className="cursor-pointer py-1 text-center text-xs text-neutral-500 transition-colors select-none hover:text-neutral-800"
                onClick={handleLoadMore}
              >
                共{totalReplies}条回复，点击查看更多
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentItem;
