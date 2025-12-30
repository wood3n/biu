import React, { useEffect, useRef, useState } from "react";

import {
  addToast,
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Spinner,
  Tab,
  Tabs,
  Tooltip,
  useDisclosure,
} from "@heroui/react";
import { RiAddLine, RiDeleteBinLine, RiEditLine } from "@remixicon/react";

import ScrollContainer, { type ScrollRefObject } from "@/components/scroll-container";
import VirtualGridPageList from "@/components/virtual-grid-page-list";
import { getRelationFollowings, type RelationListItem } from "@/service/relation-followings";
import {
  createRelationTag,
  deleteRelationTag,
  getRelationTag,
  getRelationTags,
  type RelationTag,
  type RelationTagUser,
  updateRelationTag,
} from "@/service/relation-tag";
import { useModalStore } from "@/store/modal";
import { useUser } from "@/store/user";

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

  // Modal State
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const [modalMode, setModalMode] = useState<"create" | "rename">("create");
  const [currentTag, setCurrentTag] = useState<RelationTag | null>(null);
  const [tagNameInput, setTagNameInput] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

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
      const res = await getRelationFollowings({ vmid: user.mid, pn, ps: PAGE_SIZE });
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
  }, [user?.mid, activeTab]);

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
    setTagNameInput("");
    setCurrentTag(null);
    onOpen();
  };

  // Open Rename Modal
  const handleOpenRename = (tag: RelationTag) => {
    setModalMode("rename");
    setTagNameInput(tag.name);
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

  const handleSaveTag = async () => {
    if (!tagNameInput.trim()) {
      addToast({ title: "请输入分组名称", color: "danger" });
      return;
    }

    try {
      setActionLoading(true);
      if (modalMode === "create") {
        const res = await createRelationTag({ tag: tagNameInput.trim() });
        if (res.code === 0) {
          addToast({ title: "创建分组成功", color: "success" });
          setTagNameInput("");
          onClose();
          fetchTags();
        } else {
          addToast({ title: res.message || "创建分组失败", color: "danger" });
        }
      } else if (modalMode === "rename" && currentTag) {
        const res = await updateRelationTag({ tagid: currentTag.tagid, name: tagNameInput.trim() });
        if (res.code === 0) {
          addToast({ title: "修改分组名称成功", color: "success" });
          setTagNameInput("");
          onClose();
          fetchTags();
        } else {
          addToast({ title: res.message || "修改分组名称失败", color: "danger" });
        }
      }
    } catch {
      addToast({ title: modalMode === "create" ? "创建分组失败" : "修改分组名称失败", color: "danger" });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <ScrollContainer ref={scrollRef} className="h-full w-full px-4 pb-4">
      <div className="mb-4">
        <h1 className="mb-2">我的关注</h1>
        <div className="flex justify-between">
          <div className="flex items-center">
            <Tabs aria-label="关注分组" selectedKey={activeTab} onSelectionChange={key => setActiveTab(key as string)}>
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
          renderItem={item => <UserCard u={item} refresh={reload} tags={tags} />}
          getScrollElement={() => scrollRef.current?.osInstance()?.elements().viewport || null}
          onLoadMore={loadMore}
          rowHeight={240}
          hasMore={hasMore}
          loading={loading}
        />
      )}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {onClose => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {modalMode === "create" ? "创建分组" : "修改分组名称"}
              </ModalHeader>
              <ModalBody>
                <Input
                  placeholder="请输入分组名称"
                  value={tagNameInput}
                  onValueChange={setTagNameInput}
                  variant="bordered"
                />
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  取消
                </Button>
                <Button color="primary" onPress={handleSaveTag} isLoading={actionLoading}>
                  {modalMode === "create" ? "创建" : "保存"}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </ScrollContainer>
  );
};

export default FollowList;
