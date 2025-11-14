import { Button, useDisclosure } from "@heroui/react";
import { RiDeleteBinLine } from "@remixicon/react";

import ConfirmModal from "@/components/confirm-modal";
import { postHistoryToViewDel } from "@/service/history-toview-del";
import { type ToViewVideoItem } from "@/service/history-toview-list";

interface Props {
  data?: ToViewVideoItem;
  refresh: () => void;
}

const ActionMenu = ({ data, refresh }: Props) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  return (
    <div className="relative ml-2 h-6 w-6">
      <Button
        isIconOnly
        variant="light"
        radius="full"
        size="sm"
        className="absolute -top-[4px] -right-[12px] text-zinc-500"
        onPress={onOpen}
      >
        <RiDeleteBinLine size={16} />
      </Button>
      <ConfirmModal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        type="danger"
        title="确认删除吗？"
        confirmText="删除"
        onConfirm={async () => {
          const res = await postHistoryToViewDel({
            aid: data?.aid,
          });

          if (res.code === 0) {
            refresh?.();
          }

          return res.code === 0;
        }}
      />
    </div>
  );
};

export default ActionMenu;
