import React from "react";

import { Checkbox, Divider, Button } from "@heroui/react";
import { useShallow } from "zustand/react/shallow";

import ShortcutRecorder from "@/components/shortcut-recorder";
import { useShortcutSettings } from "@/store/shortcuts";

const ShortcutSettingsPage = () => {
  const { shortcuts, enableGlobalShortcuts, useSystemMediaShortcuts, update, reset } = useShortcutSettings(
    useShallow(state => ({
      shortcuts: state.shortcuts,
      enableGlobalShortcuts: state.enableGlobalShortcuts,
      useSystemMediaShortcuts: state.useSystemMediaShortcuts,
      update: state.update,
      reset: state.reset,
    })),
  );

  const handleShortcutChange = (id: ShortcutCommand, key: "shortcut" | "globalShortcut", value: string) => {
    const newShortcuts = shortcuts.map(s => {
      if (s.id === id) {
        return { ...s, [key]: value };
      }
      return s;
    });
    update({ shortcuts: newShortcuts });
  };

  const checkConflict = (currentId: string, value: string, type: "shortcut" | "globalShortcut") => {
    if (!value) return false;
    return shortcuts.some(s => s.id !== currentId && s[type] === value);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2>快捷键设置</h2>
        <Button size="sm" variant="flat" onPress={reset}>
          恢复默认
        </Button>
      </div>

      <div className="grid grid-cols-[1fr_200px_200px_100px] gap-4 text-sm font-medium text-zinc-500">
        <div>功能说明</div>
        <div>快捷键</div>
        <div>全局快捷键</div>
        <div></div>
      </div>

      <div className="space-y-4">
        {shortcuts.map(item => {
          const isShortcutConflict = checkConflict(item.id, item.shortcut, "shortcut");
          const isGlobalConflict = checkConflict(item.id, item.globalShortcut, "globalShortcut");

          return (
            <div key={item.id} className="grid grid-cols-[1fr_200px_200px_100px] items-center gap-4">
              <div className="text-medium">{item.name}</div>
              <div>
                <ShortcutRecorder value={item.shortcut} onChange={v => handleShortcutChange(item.id, "shortcut", v)} />
                {isShortcutConflict && <div className="text-danger mt-1 text-xs">热键被占用</div>}
              </div>
              <div>
                <ShortcutRecorder
                  value={item.globalShortcut}
                  onChange={v => handleShortcutChange(item.id, "globalShortcut", v)}
                />
                {isGlobalConflict && <div className="text-danger mt-1 text-xs">热键被占用</div>}
              </div>
              <div className="flex justify-end">
                {/* Status or other info */}
                {(isShortcutConflict || isGlobalConflict) && <span className="text-danger text-xs">冲突</span>}
              </div>
            </div>
          );
        })}
      </div>

      <Divider />

      <div className="space-y-4">
        <Checkbox isSelected={enableGlobalShortcuts} onValueChange={v => update({ enableGlobalShortcuts: v })}>
          启用全局快捷键 (云音乐在后台时也能响应)
        </Checkbox>

        <Checkbox isSelected={useSystemMediaShortcuts} onValueChange={v => update({ useSystemMediaShortcuts: v })}>
          使用系统媒体快捷键 (播放/暂停、上一首、下一首、停止)
        </Checkbox>
      </div>
    </div>
  );
};

export default ShortcutSettingsPage;
