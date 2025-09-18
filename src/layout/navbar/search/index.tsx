import React, { useCallback, useMemo, useState } from "react";

import {
  Alert,
  Button,
  Card,
  CardBody,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  Spinner,
  Tabs,
  Tab,
  addToast,
  useDisclosure,
} from "@heroui/react";
import { RiSearchLine } from "@remixicon/react";
import { useRequest } from "ahooks";

import {
  getWebInterfaceWbiSearchType,
  type SearchUserItem,
  type SearchVideoItem,
  type WebSearchTypeData,
} from "@/service/web-interface-search-type";

const GRID_CLASS = "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3";

const SearchBox: React.FC = () => {
  const [keyword, setKeyword] = useState("");
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const doSearchService = useCallback(async (kw: string) => {
    const [videoRes, userRes] = await Promise.all([
      getWebInterfaceWbiSearchType<SearchVideoItem>({ search_type: "video", keyword: kw, page: 1, order: "totalrank" }),
      getWebInterfaceWbiSearchType<SearchUserItem>({ search_type: "bili_user", keyword: kw, page: 1, order: 0 }),
    ]);
    const videos = Array.isArray(videoRes.data.result) ? (videoRes.data.result as SearchVideoItem[]) : [];
    const users = Array.isArray(userRes.data.result) ? (userRes.data.result as SearchUserItem[]) : [];
    return {
      videos,
      users,
      meta: {
        video: videoRes.data as WebSearchTypeData<SearchVideoItem>,
        user: userRes.data as WebSearchTypeData<SearchUserItem>,
      },
    };
  }, []);

  const { loading, data, error, run } = useRequest(doSearchService, { manual: true });

  const onSearch = useCallback(
    (kw?: string) => {
      const value = (kw ?? keyword).trim();
      if (!value) {
        addToast({ title: "请输入搜索内容", description: "关键词不能为空", color: "warning" });
        return;
      }
      if (!isOpen) onOpen();
      run(value);
    },
    [keyword, isOpen, onOpen, run],
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") onSearch();
  };

  const videos = data?.videos ?? [];
  const users = data?.users ?? [];

  const hasNoResult = useMemo(
    () => !loading && !error && videos.length === 0 && users.length === 0,
    [loading, error, videos.length, users.length],
  );

  return (
    <>
      {/* Navbar 区域的搜索框 */}
      <div className="flex items-center space-x-2">
        <Input
          value={keyword}
          onValueChange={setKeyword}
          onKeyDown={handleKeyDown}
          placeholder="搜索视频 / 用户"
          size="sm"
          className="w-52 md:w-64 lg:w-80"
          startContent={<RiSearchLine size={16} />}
        />
        <Button color="primary" size="sm" startContent={<RiSearchLine size={16} />} onPress={() => onSearch()}>
          搜索
        </Button>
      </div>

      {/* 结果弹窗 */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="5xl" scrollBehavior="inside">
        <ModalContent>
          <ModalHeader className="flex items-center gap-2">
            <Input
              value={keyword}
              onValueChange={setKeyword}
              onKeyDown={handleKeyDown}
              placeholder="搜索视频 / 用户"
              size="sm"
              startContent={<RiSearchLine size={16} />}
              className="flex-1"
            />
            <Button color="primary" size="sm" startContent={<RiSearchLine size={16} />} onPress={() => onSearch()}>
              搜索
            </Button>
          </ModalHeader>
          <ModalBody>
            {loading && (
              <div className="flex items-center justify-center py-16">
                <Spinner label="加载中" />
              </div>
            )}

            {!!error && (
              <Alert color="danger" title="搜索失败" description={(error as Error)?.message || "请稍后重试"} />
            )}

            {!loading && !error && (
              <div className="flex flex-col gap-6">
                <Tabs aria-label="搜索结果" color="primary" fullWidth>
                  <Tab key="video" title={`视频 (${videos.length})`}>
                    {videos.length === 0 ? (
                      <div className="text-foreground-500 text-sm">暂无视频结果</div>
                    ) : (
                      <div className={GRID_CLASS}>
                        {videos.map((v, idx) => (
                          <Card key={(v.bvid || v.aid || idx).toString()} className="h-full">
                            <CardBody className="space-y-2">
                              {/* 封面图 */}
                              {v.pic && (
                                <img
                                  src={v.pic}
                                  alt="cover"
                                  className="bg-default-100 h-28 w-full rounded object-cover"
                                  referrerPolicy="no-referrer"
                                />
                              )}
                              <div
                                className="line-clamp-2 text-base font-medium"
                                dangerouslySetInnerHTML={{ __html: v.title ?? "" }}
                              />
                              <div className="text-small text-foreground-500">UP：{v.author ?? "-"}</div>
                              <div className="text-tiny text-foreground-400">
                                播放：{v.play ?? 0} · 弹幕：{v.video_review ?? 0}
                              </div>
                            </CardBody>
                          </Card>
                        ))}
                      </div>
                    )}
                  </Tab>
                  <Tab key="user" title={`用户 (${users.length})`}>
                    {users.length === 0 ? (
                      <div className="text-foreground-500 text-sm">暂无用户结果</div>
                    ) : (
                      <div className={GRID_CLASS}>
                        {users.map(u => (
                          <Card key={u.mid} className="h-full">
                            <CardBody className="space-y-2">
                              <div className="flex items-center gap-3">
                                <img
                                  src={(u as any).upic || (u as any).face}
                                  alt={u.uname}
                                  className="h-10 w-10 rounded-full object-cover"
                                  referrerPolicy="no-referrer"
                                />
                                <div className="min-w-0">
                                  <div className="truncate text-base font-medium" title={u.uname}>
                                    {u.uname}
                                  </div>
                                  <div className="text-tiny text-foreground-400 truncate" title={u.usign ?? ""}>
                                    {u.usign ?? ""}
                                  </div>
                                </div>
                              </div>
                              <div className="text-tiny text-foreground-400">粉丝：{u.fans ?? 0}</div>
                            </CardBody>
                          </Card>
                        ))}
                      </div>
                    )}
                  </Tab>
                </Tabs>

                {hasNoResult && <div className="text-foreground-500 text-sm">没有找到与“{keyword}”相关的结果</div>}
              </div>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default SearchBox;
