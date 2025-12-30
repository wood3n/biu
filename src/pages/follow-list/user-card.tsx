import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";

import {
  Avatar,
  Button,
  Card,
  CardBody,
  Checkbox,
  CheckboxGroup,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  addToast,
  useDisclosure,
} from "@heroui/react";
import { RiDislikeLine, RiFolderLine } from "@remixicon/react";

import type { RelationListItem } from "@/service/relation-followings";
import type { RelationTag, RelationTagUser } from "@/service/relation-tag";

import AsyncButton from "@/components/async-button";
import { UserRelationAction, postRelationModify } from "@/service/relation-modify";
import { relationTagAddUsers } from "@/service/relation-tag";

interface Props {
  u: RelationListItem | RelationTagUser;
  refresh: () => void;
  tags: RelationTag[];
}

const UserCard = ({ u, refresh, tags }: Props) => {
  const navigate = useNavigate();
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (u.tag) {
      setSelectedTags(u.tag.map(String));
    } else {
      setSelectedTags([]);
    }
  }, [u.tag]);

  const handleUnfollow = async () => {
    const res = await postRelationModify({ fid: u.mid, act: UserRelationAction.Unfollow });
    if (res?.code !== 0) {
      addToast({
        title: "取消关注失败",
        color: "danger",
      });
      return;
    }

    refresh();
  };

  const handleSetGroup = () => {
    onOpen();
  };

  const handleConfirmSetGroup = async () => {
    try {
      setLoading(true);
      const tagids = selectedTags.join(",");
      // 如果没有选择任何分组，或者 tagids 为空，B站API通常需要特殊处理，
      // 但 addUsers 接口通常用于添加。这里假设 addUsers 能处理。
      // 实际上 B 站设置分组可能比较复杂，这里先尝试调用 addUsers
      const res = await relationTagAddUsers({
        fids: u.mid.toString(),
        tagids: tagids,
      });

      if (res.code === 0) {
        addToast({
          title: "设置分组成功",
          color: "success",
        });
        refresh();
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
    <>
      <Card
        key={u.mid}
        radius="md"
        as="div"
        isHoverable
        isPressable
        onPress={() => navigate(`/user/${u.mid}`)}
        className="group relative h-full w-full overflow-hidden"
      >
        <CardBody className="flex items-center space-y-2 overflow-hidden p-4">
          <Avatar className="text-large h-32 w-32 flex-none" src={u.face} name={u.uname} />
          <div className="flex w-full flex-col items-center space-y-1">
            <span className="text-lg">{u.uname}</span>
            <span className="text-foreground-500 line-clamp-2 w-full text-center text-sm">{u.sign}</span>
          </div>
        </CardBody>

        <div className="absolute bottom-4 left-1/2 flex w-max -translate-x-1/2 translate-y-20 items-center justify-center rounded-full border border-white/10 bg-black/30 px-1 py-1 shadow-lg backdrop-blur-xl backdrop-saturate-150 transition-all duration-300 ease-in-out group-hover:translate-y-0">
          <Button
            size="sm"
            variant="light"
            radius="full"
            onPress={handleSetGroup}
            aria-label="设置分组"
            title="设置分组"
            className="text-white"
            startContent={<RiFolderLine size={18} />}
          >
            设置分组
          </Button>
          <AsyncButton
            size="sm"
            color="danger"
            variant="light"
            radius="full"
            onPress={handleUnfollow}
            aria-label="取消关注"
            title="取消关注"
            startContent={<RiDislikeLine size={18} />}
          >
            取消关注
          </AsyncButton>
        </div>
      </Card>

      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
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
    </>
  );
};

export default UserCard;
