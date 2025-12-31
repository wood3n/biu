import React, { useEffect, useState } from "react";

import { addToast, Button, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@heroui/react";

import { createRelationTag, type RelationTag, updateRelationTag } from "@/service/relation-tag";

interface Props {
  isOpen: boolean;
  onOpenChange: () => void;
  onClose: () => void;
  mode: "create" | "rename";
  tag: RelationTag | null;
  onSuccess: () => void;
}

const GroupModal = ({ isOpen, onOpenChange, onClose, mode, tag, onSuccess }: Props) => {
  const [tagNameInput, setTagNameInput] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (mode === "create") {
        setTagNameInput("");
      } else if (mode === "rename" && tag) {
        setTagNameInput(tag.name);
      }
    }
  }, [isOpen, mode, tag]);

  const handleSaveTag = async () => {
    if (!tagNameInput.trim()) {
      addToast({ title: "请输入分组名称", color: "danger" });
      return;
    }

    try {
      setLoading(true);
      if (mode === "create") {
        const res = await createRelationTag({ tag: tagNameInput.trim() });
        if (res.code === 0) {
          addToast({ title: "创建分组成功", color: "success" });
          setTagNameInput("");
          onClose();
          onSuccess();
        } else {
          addToast({ title: res.message || "创建分组失败", color: "danger" });
        }
      } else if (mode === "rename" && tag) {
        const res = await updateRelationTag({ tagid: tag.tagid, name: tagNameInput.trim() });
        if (res.code === 0) {
          addToast({ title: "修改分组名称成功", color: "success" });
          setTagNameInput("");
          onClose();
          onSuccess();
        } else {
          addToast({ title: res.message || "修改分组名称失败", color: "danger" });
        }
      }
    } catch {
      addToast({ title: mode === "create" ? "创建分组失败" : "修改分组名称失败", color: "danger" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal disableAnimation isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        {onClose => (
          <>
            <ModalHeader className="flex flex-col gap-1">{mode === "create" ? "创建分组" : "修改分组名称"}</ModalHeader>
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
              <Button color="primary" onPress={handleSaveTag} isLoading={loading}>
                {mode === "create" ? "创建" : "保存"}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default GroupModal;
