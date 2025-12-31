import React, { useEffect, useState } from "react";

import {
  Button,
  Checkbox,
  CheckboxGroup,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  addToast,
} from "@heroui/react";

import type { RelationListItem } from "@/service/relation-followings";

import { type RelationTag, type RelationTagUser, relationTagAddUsers } from "@/service/relation-tag";

interface Props {
  isOpen: boolean;
  onOpenChange: () => void;
  onClose: () => void;
  user: RelationListItem | RelationTagUser | null;
  tags: RelationTag[];
  onSuccess: () => void;
}

const SetGroupModal = ({ isOpen, onOpenChange, onClose, user, tags, onSuccess }: Props) => {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      if (user.tag) {
        setSelectedTags(user.tag.map(String));
      } else {
        setSelectedTags([]);
      }
    }
  }, [isOpen, user]);

  const handleConfirmSetGroup = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const tagids = selectedTags.join(",");
      // 如果没有选择任何分组，或者 tagids 为空，B站API通常需要特殊处理，
      // 但 addUsers 接口通常用于添加。这里假设 addUsers 能处理。
      // 实际上 B 站设置分组可能比较复杂，这里先尝试调用 addUsers
      const res = await relationTagAddUsers({
        fids: user.mid.toString(),
        tagids: tagids,
      });

      if (res.code === 0) {
        addToast({
          title: "设置分组成功",
          color: "success",
        });
        onSuccess();
        onClose();
      } else {
        addToast({
          title: res.message || "设置分组失败",
          color: "danger",
        });
      }
    } catch (error) {
      console.error(error);
      addToast({
        title: "设置分组失败",
        color: "danger",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal disableAnimation isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        {onClose => (
          <>
            <ModalHeader className="flex flex-col gap-1">设置分组</ModalHeader>
            <ModalBody>
              <CheckboxGroup value={selectedTags} onValueChange={setSelectedTags}>
                {tags.map(tag => (
                  <Checkbox key={tag.tagid} value={tag.tagid.toString()}>
                    {tag.name}
                  </Checkbox>
                ))}
              </CheckboxGroup>
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={onClose}>
                取消
              </Button>
              <Button color="primary" isLoading={loading} onPress={handleConfirmSetGroup}>
                保存
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default SetGroupModal;
