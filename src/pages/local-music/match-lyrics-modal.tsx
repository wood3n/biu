import { useEffect, useState } from "react";

import { Button, Checkbox, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@heroui/react";

import type { MatchOptions } from "./use-batch-match-lyrics";

/** 时长差容忍阈值（秒）默认值 */
const DEFAULT_TOLERANCE_SEC = 5;

interface Props {
  isOpen: boolean;
  /** 待匹配数量，用于文案 */
  count: number;
  onOpenChange: (isOpen: boolean) => void;
  onConfirm: (opts: MatchOptions) => void;
}

const MatchLyricsModal = ({ isOpen, count, onOpenChange, onConfirm }: Props) => {
  const [toleranceInput, setToleranceInput] = useState(String(DEFAULT_TOLERANCE_SEC));
  const [overwrite, setOverwrite] = useState(false);

  // 每次打开重置为默认值
  useEffect(() => {
    if (isOpen) {
      setToleranceInput(String(DEFAULT_TOLERANCE_SEC));
      setOverwrite(false);
    }
  }, [isOpen]);

  const handleConfirm = () => {
    const parsed = Number(toleranceInput);
    const toleranceSec = Number.isFinite(parsed) && parsed >= 0 ? parsed : DEFAULT_TOLERANCE_SEC;
    onConfirm({ toleranceSec, overwrite });
    onOpenChange(false);
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} radius="md" placement="center" size="sm">
      <ModalContent>
        {onClose => (
          <>
            <ModalHeader>匹配歌词设置</ModalHeader>
            <ModalBody className="gap-4">
              <Input
                type="number"
                min={0}
                step={1}
                label="时长容忍（秒）"
                labelPlacement="outside"
                description="本地与候选时长差不超过该值才视为匹配"
                value={toleranceInput}
                onValueChange={setToleranceInput}
              />
              <Checkbox size="sm" isSelected={overwrite} onValueChange={setOverwrite} classNames={{ label: "text-sm" }}>
                覆盖已有歌词
              </Checkbox>
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onClose}>
                取消
              </Button>
              <Button color="primary" className="dark:text-black" onPress={handleConfirm}>
                {count > 1 ? `匹配 ${count} 首` : "开始匹配"}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default MatchLyricsModal;
