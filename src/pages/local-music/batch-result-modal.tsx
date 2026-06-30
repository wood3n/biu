import { useMemo } from "react";

import { Modal, ModalBody, ModalContent, ModalHeader } from "@heroui/react";
import {
  RiCheckboxCircleFill,
  RiErrorWarningFill,
  RiIndeterminateCircleFill,
  RiSearchEyeFill,
  type RemixiconComponentType,
} from "@remixicon/react";
import { twMerge } from "tailwind-merge";

import type { BatchResultItem, BatchResultStatus } from "./batch-result";

/** 各语义色对应的文字 / 浅底 class，避免动态拼接被 Tailwind 清除 */
const COLOR_CLASS = {
  success: { text: "text-success", soft: "bg-success/10" },
  warning: { text: "text-warning", soft: "bg-warning/10" },
  danger: { text: "text-danger", soft: "bg-danger/10" },
  default: { text: "text-foreground-500", soft: "bg-default-100" },
} as const;

type ColorKey = keyof typeof COLOR_CLASS;

/** 状态展示元数据：分组顺序即此处声明顺序 */
const STATUS_META: { status: BatchResultStatus; label: string; color: ColorKey; icon: RemixiconComponentType }[] = [
  { status: "miss", label: "未命中", color: "warning", icon: RiSearchEyeFill },
  { status: "failed", label: "写入失败", color: "danger", icon: RiErrorWarningFill },
  { status: "delete-failed", label: "删除失败", color: "danger", icon: RiErrorWarningFill },
  { status: "matched", label: "已匹配", color: "success", icon: RiCheckboxCircleFill },
  { status: "deleted", label: "已删除", color: "success", icon: RiCheckboxCircleFill },
  { status: "skipped", label: "已跳过（已有歌词）", color: "default", icon: RiIndeterminateCircleFill },
];

interface Props {
  isOpen: boolean;
  title: string;
  items: BatchResultItem[];
  onOpenChange: (isOpen: boolean) => void;
}

const BatchResultModal = ({ isOpen, title, items, onOpenChange }: Props) => {
  // 按状态分组，保留 STATUS_META 顺序，空组不展示
  const groups = useMemo(() => {
    return STATUS_META.map(meta => ({
      ...meta,
      cc: COLOR_CLASS[meta.color],
      list: items.filter(i => i.status === meta.status),
    })).filter(g => g.list.length > 0);
  }, [items]);

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} radius="md" placement="center" size="md" scrollBehavior="inside">
      <ModalContent>
        <ModalHeader className="pb-2">{title}</ModalHeader>
        <ModalBody className="gap-4 pb-6">
          {groups.length === 0 ? (
            <div className="text-foreground-500 py-6 text-center text-sm">暂无结果</div>
          ) : (
            <div className="space-y-3">
              {groups.map(group => {
                const Icon = group.icon;
                return (
                  <section key={group.status} className="border-default-200 overflow-hidden rounded-xl border">
                    <div className={twMerge("flex items-center gap-2 px-3 py-2", group.cc.soft)}>
                      <Icon size={16} className={group.cc.text} />
                      <span className={twMerge("text-sm font-medium", group.cc.text)}>{group.label}</span>
                      <span className="text-foreground-500 ml-auto text-xs tabular-nums">{group.list.length} 首</span>
                    </div>
                    <ul className="divide-default-100 divide-y">
                      {group.list.map(item => (
                        <li key={item.id} className="hover:bg-default-50 flex items-center gap-2 px-3 py-2 text-sm">
                          <span className="min-w-0 flex-1 truncate">{item.title}</span>
                          {item.message && <span className="text-foreground-400 shrink-0 text-xs">{item.message}</span>}
                        </li>
                      ))}
                    </ul>
                  </section>
                );
              })}
            </div>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default BatchResultModal;
