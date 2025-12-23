import { Button } from "@heroui/react";
import { RiDeleteBinLine } from "@remixicon/react";

import { postHistoryToViewDel } from "@/service/history-toview-del";
import { type ToViewVideoItem } from "@/service/history-toview-list";
import { useModalStore } from "@/store/modal";

interface Props {
  data?: ToViewVideoItem;
  refresh: () => void;
}

const ActionMenu = ({ data, refresh }: Props) => {
  const onOpenConfirmModal = useModalStore(s => s.onOpenConfirmModal);

  return (
    <div className="relative ml-2 h-6 w-6">
      <Button
        isIconOnly
        variant="light"
        radius="full"
        size="sm"
        className="absolute -top-[4px] -right-[12px] text-zinc-500"
        onPress={() => {
          onOpenConfirmModal({
            title: "确认删除吗？",
            confirmText: "删除",
            onConfirm: async () => {
              const res = await postHistoryToViewDel({
                aid: data?.aid,
              });

              if (res.code === 0) {
                refresh?.();
              }

              return res.code === 0;
            },
          });
        }}
      >
        <RiDeleteBinLine size={16} />
      </Button>
    </div>
  );
};

export default ActionMenu;
