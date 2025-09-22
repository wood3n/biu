import { useState } from "react";
import type { ReactNode } from "react";

import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@heroui/react";
import { RiErrorWarningLine } from "@remixicon/react";

export interface ConfirmModalProps {
  // 显示/隐藏控制（受控）
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;

  // 文案
  title: ReactNode;
  description?: ReactNode;

  // 行为
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;

  // 配置
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean; // 是否显示取消按钮，默认 true
  isDanger?: boolean; // 确认为危险操作时，按钮用 danger 颜色
  closeOnConfirm?: boolean; // 确认后是否自动关闭，默认 true
}

/**
 * 通用确认弹窗（HeroUI）
 * - 受控：通过 isOpen / onOpenChange 控制显示与隐藏
 * - 支持异步确认：onConfirm 可返回 Promise，期间按钮进入加载态并避免关闭
 */
const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onOpenChange,
  title,
  description,
  onConfirm,
  onCancel,
  confirmText = "确认",
  cancelText = "取消",
  showCancel = true,
  isDanger = false,
  closeOnConfirm = true,
}) => {
  const [loading, setLoading] = useState(false);

  const handleClose = () => onOpenChange(false);

  const handleCancel = async () => {
    onCancel?.();
    handleClose();
  };

  const handleConfirm = async () => {
    try {
      setLoading(true);
      await onConfirm?.();
      if (closeOnConfirm) handleClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal disableAnimation isOpen={isOpen} onOpenChange={onOpenChange} isDismissable={false}>
      <ModalContent>
        {() => (
          <>
            <ModalHeader className="flex items-center gap-1">
              <RiErrorWarningLine color="#dc1258" />
              <span>{title}</span>
            </ModalHeader>
            {description ? (
              <ModalBody>
                <div className="text-sm text-zinc-500">{description}</div>
              </ModalBody>
            ) : null}
            <ModalFooter>
              {showCancel && (
                <Button variant="light" onPress={handleCancel} isDisabled={loading}>
                  {cancelText}
                </Button>
              )}
              <Button color={isDanger ? "danger" : "primary"} onPress={handleConfirm} isLoading={loading}>
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
