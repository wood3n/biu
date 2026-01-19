import React, { useCallback, useEffect, useRef, useState } from "react";

import { Button, Spinner } from "@heroui/react";

import ScrollContainer, { type ScrollRefObject } from "@/components/scroll-container";
import { getRelationFollowings } from "@/service/relation-followings";
import { useUser } from "@/store/user";

import UserItem, { type AuthorItem } from "./user";

interface AuthorListProps {
  selectedAuthorMid: number | null;
  onSelect: (mid: number | null) => void;
}

const AuthorList: React.FC<AuthorListProps> = ({ selectedAuthorMid, onSelect }) => {
  const user = useUser(s => s.user);
  const scrollRef = useRef<ScrollRefObject>(null);
  const [scrollElement, setScrollElement] = useState<HTMLElement | null>(null);
  const [list, setList] = useState<AuthorItem[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loadingRef = useRef(false);

  const fetchFollowings = useCallback(
    async (pageIndex: number = 1) => {
      if (!user?.mid || loadingRef.current) return;
      loadingRef.current = true;
      setLoading(true);
      setError(null);
      try {
        const res = await getRelationFollowings({ vmid: user.mid, pn: pageIndex, ps: 20, order_type: "attention" });
        if (res.code === 0) {
          const nextList = (res.data.list || []).map(item => ({
            mid: item.mid,
            face: item.face,
            name: item.uname,
          }));
          setList(prev => {
            const combined = pageIndex === 1 ? nextList : [...prev, ...nextList];
            setHasMore(combined.length < (res.data.total || 0));
            if (pageIndex === 1 && (res.data.total || 0) === 0) {
              setHasMore(false);
            }
            return combined;
          });
          setPage(pageIndex);
        } else {
          setError(res.message || "无法加载关注列表");
        }
      } catch {
        setError("无法加载关注列表");
      } finally {
        loadingRef.current = false;
        setLoading(false);
      }
    },
    [user?.mid],
  );

  const handleScroll = useCallback(() => {
    if (!scrollElement || loading || !hasMore || error) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollElement;
    if (scrollHeight - scrollTop - clientHeight < 200) {
      fetchFollowings(page + 1);
    }
  }, [scrollElement, loading, hasMore, error, fetchFollowings, page]);

  useEffect(() => {
    const initScrollElement = () => {
      if (scrollRef.current) {
        const instance = scrollRef.current.osInstance();
        if (instance) {
          setScrollElement(instance.elements().viewport);
        }
      }
    };
    initScrollElement();
    const timer = setTimeout(initScrollElement, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!scrollRef.current) return;
    const instance = scrollRef.current.osInstance();
    if (!instance) return;
    const viewport = instance.elements().viewport;
    viewport.addEventListener("scroll", handleScroll);
    return () => {
      viewport.removeEventListener("scroll", handleScroll);
    };
  }, [handleScroll]);

  useEffect(() => {
    setList([]);
    setPage(1);
    setHasMore(true);
    if (user?.mid) {
      fetchFollowings(1);
    }
  }, [fetchFollowings, user?.mid]);

  return (
    <div className="h-full w-64">
      <div className="border-divider/40 flex h-full flex-col border-r">
        <div className="mb-2 px-4">
          <h1 className="min-w-0 truncate">用户动态</h1>
        </div>
        <ScrollContainer ref={scrollRef} className="h-full min-h-0 w-full flex-1 px-2">
          <div className="flex min-h-0 flex-1 flex-col gap-2">
            <UserItem author={null} isSelected={selectedAuthorMid === null} onSelect={onSelect} layout="row" />
            {list.map(author => (
              <UserItem
                key={author.mid}
                author={author}
                isSelected={selectedAuthorMid === author.mid}
                onSelect={onSelect}
                layout="row"
              />
            ))}
            {loading && (
              <div className="text-default-500 flex items-center gap-2 px-2 py-2">
                <Spinner size="sm" />
                <span>加载中...</span>
              </div>
            )}
            {!loading && error && (
              <div className="flex flex-col items-start gap-2 px-2 py-2">
                <p className="text-danger text-sm">{error}</p>
                <Button size="sm" onPress={() => fetchFollowings(page)}>
                  重试
                </Button>
              </div>
            )}
            {!loading && !hasMore && list.length === 0 && !error && (
              <p className="text-default-400 px-2 text-sm">暂无关注</p>
            )}
          </div>
        </ScrollContainer>
      </div>
    </div>
  );
};

export default AuthorList;
