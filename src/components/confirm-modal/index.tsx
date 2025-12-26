import { useState } from "react";

import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@heroui/react";
import { RiErrorWarningLine } from "@remixicon/react";
import { useShallow } from "zustand/shallow";

import { useModalStore } from "@/store/modal";
import { useSettings } from "@/store/settings";

type ConfirmModalType = "warning" | "danger" | "primary";

const colorMap: Record<Exclude<ConfirmModalType, "primary">, string> = {
  warning: "#F5A524",
  danger: "#dc1258",
};

/**
 * 通用确认弹窗（HeroUI）
 * - 受控：通过 useModalStore 控制显示与隐藏
 * - 支持异步确认：onConfirm 可返回 Promise，期间按钮进入加载态并避免关闭
 */
const ConfirmModal = () => {
  const { isConfirmModalOpen, onConfirmModalOpenChange, confirmModalData } = useModalStore(
    useShallow(state => ({
      isConfirmModalOpen: state.isConfirmModalOpen,
      onConfirmModalOpenChange: state.onConfirmModalOpenChange,
      confirmModalData: state.confirmModalData,
    })),
  );
  const {
    type = "danger",
    title,
    description,
    onConfirm,
    confirmText = "确认",
    cancelText = "取消",
  } = confirmModalData || {};

  const primaryColor = useSettings(s => s.primaryColor);
  const [loading, setLoading] = useState(false);

  // 根据类型获取图标颜色
  const getIconColor = () => {
    if (type === "primary") {
      return primaryColor;
    }
    return colorMap[type as Exclude<ConfirmModalType, "primary">];
  };

  const handleClose = () => onConfirmModalOpenChange(false);

  const handleConfirm = async () => {
    try {
      setLoading(true);
      const result = await onConfirm?.();
      if (result) {
        handleClose();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      disableAnimation
      radius="md"
      isOpen={isConfirmModalOpen}
      onOpenChange={onConfirmModalOpenChange}
      isDismissable={false}
    >
      <ModalContent>
        {() => (
          <>
            <ModalHeader className="flex items-center gap-1 [&>span]:text-[var(--heroui-foreground)]">
              <RiErrorWarningLine color={getIconColor()} />
              <span>{title}</span>
            </ModalHeader>
            {description ? (
              <ModalBody>
                <div className="text-sm text-zinc-500">{description}</div>
              </ModalBody>
            ) : null}
            <ModalFooter>
              <Button variant="light" onPress={handleClose} isDisabled={loading}>
                {cancelText}
              </Button>
              <Button color={type === "primary" ? "primary" : type} onPress={handleConfirm} isLoading={loading}>
                {confirmText}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default ConfirmModal;
