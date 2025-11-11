import { useState } from "react";
import type { ReactNode } from "react";

import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@heroui/react";
import { RiErrorWarningLine } from "@remixicon/react";

export interface ConfirmModalProps {
  type: "warning" | "danger";
  // 显示/隐藏控制（受控）
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;

  // 文案
  title: ReactNode;
  description?: ReactNode;

  // 行为
  onConfirm: () => Promise<boolean>;

  // 配置
  confirmText?: string;
  cancelText?: string;
}

const colorMap: Record<ConfirmModalProps["type"], string> = {
  warning: "#F5A524",
  danger: "#dc1258",
};

/**
 * 通用确认弹窗（HeroUI）
 * - 受控：通过 isOpen / onOpenChange 控制显示与隐藏
 * - 支持异步确认：onConfirm 可返回 Promise，期间按钮进入加载态并避免关闭
 */
const ConfirmModal: React.FC<ConfirmModalProps> = ({
  type = "danger",
  isOpen,
  onOpenChange,
  title,
  description,
  onConfirm,
  confirmText = "确认",
  cancelText = "取消",
}) => {
  const [loading, setLoading] = useState(false);

  const handleClose = () => onOpenChange(false);

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
    <Modal disableAnimation radius="md" isOpen={isOpen} onOpenChange={onOpenChange} isDismissable={false}>
      <ModalContent>
        {() => (
          <>
            <ModalHeader className="flex items-center gap-1">
              <RiErrorWarningLine color={colorMap[type]} />
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
              <Button color={type} onPress={handleConfirm} isLoading={loading}>
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
