import { useEffect, useMemo, useState } from "react";

import { Button, Checkbox, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@heroui/react";

interface DirOption {
  /** 目录完整路径，作为唯一标识 */
  dir: string;
  /** 展示用目录名 */
  name: string;
  /** 该目录下歌曲数量 */
  count: number;
}

interface Props {
  isOpen: boolean;
  dirs: DirOption[];
  onOpenChange: (isOpen: boolean) => void;
  /** 确认：返回选中的目录路径集合 */
  onConfirm: (selectedDirs: string[]) => void;
}

const AddToPlaylistModal = ({ isOpen, dirs, onOpenChange, onConfirm }: Props) => {
  // 选中目录集合，默认全选
  const [selected, setSelected] = useState<Set<string>>(() => new Set());

  // 每次打开重置为全选
  useEffect(() => {
    if (isOpen) setSelected(new Set(dirs.map(d => d.dir)));
  }, [isOpen, dirs]);

  const allSelected = dirs.length > 0 && dirs.every(d => selected.has(d.dir));

  const toggleAll = () => {
    setSelected(allSelected ? new Set() : new Set(dirs.map(d => d.dir)));
  };

  const toggle = (dir: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(dir)) next.delete(dir);
      else next.add(dir);
      return next;
    });
  };

  // 选中目录下的歌曲总数，用于确认按钮文案
  const selectedCount = useMemo(
    () => dirs.filter(d => selected.has(d.dir)).reduce((sum, d) => sum + d.count, 0),
    [dirs, selected],
  );

  const handleConfirm = () => {
    onConfirm(Array.from(selected));
    onOpenChange(false);
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} radius="md" placement="center" size="sm">
      <ModalContent>
        {onClose => (
          <>
            <ModalHeader>选择目录添加到播放列表</ModalHeader>
            <ModalBody className="gap-2">
              <Checkbox size="sm" isSelected={allSelected} onValueChange={toggleAll} classNames={{ label: "text-sm" }}>
                全部目录
              </Checkbox>
              <div className="flex max-h-[300px] flex-col gap-2 overflow-y-auto pl-6">
                {dirs.map(d => (
                  <Checkbox
                    key={d.dir}
                    size="sm"
                    isSelected={selected.has(d.dir)}
                    onValueChange={() => toggle(d.dir)}
                    classNames={{ label: "text-sm w-full" }}
                  >
                    <span className="flex w-full items-center justify-between gap-2">
                      <span className="truncate">{d.name}</span>
                      <span className="text-foreground-400 shrink-0">{d.count}</span>
                    </span>
                  </Checkbox>
                ))}
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onClose}>
                取消
              </Button>
              <Button
                color="primary"
                className="dark:text-black"
                isDisabled={selectedCount === 0}
                onPress={handleConfirm}
              >
                添加 {selectedCount} 首
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default AddToPlaylistModal;
