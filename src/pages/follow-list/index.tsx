import React, { useEffect, useRef, useState } from "react";

import { addToast, Button, Input, Spinner, Tab, Tabs, Tooltip, useDisclosure } from "@heroui/react";
import { RiAddLine, RiDeleteBinLine, RiEditLine, RiSearchLine } from "@remixicon/react";

import ScrollContainer, { type ScrollRefObject } from "@/components/scroll-container";
import VirtualGridPageList from "@/components/virtual-grid-page-list";
import { getRelationFollowings, type RelationListItem } from "@/service/relation-followings";
import {
  deleteRelationTag,
  getRelationTag,
  getRelationTags,
  searchFollowings,
  type RelationTag,
  type RelationTagUser,
} from "@/service/relation-tag";
import { useModalStore } from "@/store/modal";
import { useUser } from "@/store/user";

import GroupModal from "./group-modal";
import SetGroupModal from "./set-group-modal";
import UserCard from "./user-card";

const PAGE_SIZE = 20;

const FollowList = () => {
  const user = useUser(s => s.user);
  const onOpenConfirmModal = useModalStore(s => s.onOpenConfirmModal);
  const scrollRef = useRef<ScrollRefObject>(null);

  const [list, setList] = useState<(RelationListItem | RelationTagUser)[]>([]);
  const [tags, setTags] = useState<RelationTag[]>([]);
  const [allCount, setAllCount] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [inputValue, setInputValue] = useState("");

  const onSearchChange = (val: string) => {
    setInputValue(val);
  };

  const onSearchSubmit = () => {
    setSearchKeyword(inputValue);
  };

  const onClear = () => {
    setInputValue("");
    setSearchKeyword("");
  };

  // Modal State for Create/Rename
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const [modalMode, setModalMode] = useState<"create" | "rename">("create");
  const [currentTag, setCurrentTag] = useState<RelationTag | null>(null);

  // Modal State for Set Group
  const setGroupModalDisclosure = useDisclosure();
  const [currentOperatingUser, setCurrentOperatingUser] = useState<RelationListItem | RelationTagUser | null>(null);

  // Derived state for current active tag
  const activeTagId = Number(activeTab);
  const isCustomTag = !isNaN(activeTagId) && activeTagId !== 0 && activeTagId !== -10;
  const activeTag = tags.find(t => t.tagid === activeTagId);

  const fetchTags = async () => {
    const res = await getRelationTags();
    if (res.code === 0) {
      setTags(res.data);
    }
  };

  useEffect(() => {
    if (user?.mid) {
      fetchTags();
    }
  }, [user?.mid]);

  const fetchData = async (pn: number = 1) => {
    if (!user?.mid) return;

    let newList: (RelationListItem | RelationTagUser)[] = [];
    let total = 0;

    if (activeTab === "all") {
      const res = searchKeyword
        ? await searchFollowings({ vmid: user.mid, pn, ps: PAGE_SIZE, name: searchKeyword })
        : await getRelationFollowings({ vmid: user.mid, pn, ps: PAGE_SIZE });

      if (res.code === 0) {
        setAllCount(res.data.total);
        if (res?.data?.list?.length) {
          total = res?.data?.total ?? 0;
          newList = res?.data?.list ?? [];
        }
      }
    } else {
      const tagId = Number(activeTab);
      const res = await getRelationTag({ tagid: tagId, pn, ps: PAGE_SIZE });
      if (res.code === 0 && res?.data?.length) {
        newList = res.data;
        const tag = tags.find(t => t.tagid === tagId);
        total = tag?.count ?? 0;
      }
    }

    if (newList.length > 0) {
      const combinedList = pn === 1 ? newList : [...list, ...newList];

      setList(combinedList);
      setHasMore(combinedList.length < total);
      setPage(pn);
    } else {
      if (pn === 1) setList([]);
      setHasMore(false);
    }
  };

  const init = async () => {
    try {
      setLoading(true);
      await fetchData();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.mid) {
      init();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.mid, activeTab, searchKeyword]);

  const reload = async () => {
    setList([]);
    setHasMore(true);
    await init();
  };

  const loadMore = async () => {
    if (loading || !hasMore) return;
    try {
      setLoading(true);
      await fetchData(page + 1);
    } finally {
      setLoading(false);
    }
  };

  // Open Create Modal
  const handleOpenCreate = () => {
    setModalMode("create");
    setCurrentTag(null);
    onOpen();
  };

  // Open Rename Modal
  const handleOpenRename = (tag: RelationTag) => {
    setModalMode("rename");
    setCurrentTag(tag);
    onOpen();
  };

  // Open Delete Modal
  const handleOpenDelete = (tag: RelationTag) => {
    onOpenConfirmModal({
      title: `删除分组${tag.name}`,
      type: "danger",
      confirmText: "删除",
      onConfirm: async () => {
        try {
          const res = await deleteRelationTag({ tagid: tag.tagid });
          if (res.code === 0) {
            addToast({ title: "删除分组成功", color: "success" });
            if (activeTab === String(tag.tagid)) {
              setActiveTab("all");
            }
            fetchTags();
            return true;
          } else {
            addToast({ title: res.message || "删除分组失败", color: "danger" });
            return false;
          }
        } catch {
          addToast({ title: "删除分组失败", color: "danger" });
          return false;
        }
      },
    });
  };

  const handleOpenSetGroup = (u: RelationListItem | RelationTagUser) => {
    setCurrentOperatingUser(u);
    setGroupModalDisclosure.onOpen();
  };

  return (
    <ScrollContainer ref={scrollRef} className="h-full w-full px-4 pb-4">
      <div className="mb-4">
        <h1 className="mb-2">我的关注</h1>
        <div className="flex justify-between">
          <div className="flex items-center">
            <Tabs
              aria-label="关注分组"
              classNames={{
                cursor: "rounded-medium",
              }}
              selectedKey={activeTab}
              onSelectionChange={key => setActiveTab(key as string)}
            >
              <Tab key="all" title={`全部关注${allCount ? `(${allCount})` : ""}`} />
              {tags.map(tag => (
                <Tab key={String(tag.tagid)} title={`${tag.name}${tag.count ? `(${tag.count})` : ""}`} />
              ))}
            </Tabs>
            <Tooltip content="创建分组" closeDelay={0}>
              <Button onPress={handleOpenCreate} isIconOnly variant="flat" className="ml-2">
                <RiAddLine size={18} />
              </Button>
            </Tooltip>
            {isCustomTag && activeTag && (
              <>
                <Tooltip content="修改分组名称" closeDelay={0}>
                  <Button onPress={() => handleOpenRename(activeTag)} isIconOnly variant="flat" className="ml-2">
                    <RiEditLine size={18} />
                  </Button>
                </Tooltip>
                <Tooltip content="删除分组" closeDelay={0}>
                  <Button
                    onPress={() => handleOpenDelete(activeTag)}
                    isIconOnly
                    variant="flat"
                    color="danger"
                    className="ml-2"
                  >
                    <RiDeleteBinLine size={18} />
                  </Button>
                </Tooltip>
              </>
            )}
          </div>
          {activeTab === "all" && (
            <div className="flex items-center">
              <Input
                classNames={{
                  base: "w-64",
                  inputWrapper: "h-10",
                }}
                placeholder="搜索关注"
                size="sm"
                startContent={<RiSearchLine size={16} />}
                value={inputValue}
                onValueChange={onSearchChange}
                isClearable
                onClear={onClear}
                onKeyDown={e => {
                  if (e.key === "Enter") {
                    onSearchSubmit();
                  }
                }}
              />
            </div>
          )}
        </div>
      </div>

      {loading && !list.length ? (
        <div className="flex h-[40vh] items-center justify-center">
          <Spinner label="加载中" />
        </div>
      ) : (
        <VirtualGridPageList
          items={list}
          itemKey="mid"
          renderItem={item => <UserCard u={item} refresh={reload} onSetGroup={handleOpenSetGroup} />}
          getScrollElement={() => scrollRef.current?.osInstance()?.elements().viewport || null}
          onLoadMore={loadMore}
          rowHeight={240}
          hasMore={hasMore}
          loading={loading}
        />
      )}
      <GroupModal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        onClose={onClose}
        mode={modalMode}
        tag={currentTag}
        onSuccess={fetchTags}
      />

      <SetGroupModal
        isOpen={setGroupModalDisclosure.isOpen}
        onOpenChange={setGroupModalDisclosure.onOpenChange}
        onClose={setGroupModalDisclosure.onClose}
        user={currentOperatingUser}
        tags={tags}
        onSuccess={reload}
      />
    </ScrollContainer>
  );
};

export default FollowList;
