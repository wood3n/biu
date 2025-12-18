import React from "react";

import { Checkbox, Button, addToast } from "@heroui/react";
import { useShallow } from "zustand/react/shallow";

import ShortcutKeyInput from "@/components/shortcut-key-input";
import { useShortcutSettings } from "@/store/shortcuts";

const ShortcutSettingsPage = () => {
  const { shortcuts, enableGlobalShortcuts, update, reset } = useShortcutSettings(
    useShallow(state => ({
      shortcuts: state.shortcuts,
      enableGlobalShortcuts: state.enableGlobalShortcuts,
      update: state.update,
      reset: state.reset,
    })),
  );

  const handleShortcutChange = async (id: ShortcutCommand, key: "shortcut" | "globalShortcut", value: string) => {
    const newShortcuts = shortcuts.map(s => {
      if (s.id === id) {
        return { ...s, [key]: value };
      }
      return s;
    });
    update({ shortcuts: newShortcuts });
  };

  const handleToggleGlobalShortcuts = async (enabled: boolean) => {
    if (enabled) {
      const checks = shortcuts.map(async item => {
        if (!item.globalShortcut) return null;
        const isAvailable = await window.electron.checkShortcut(item.globalShortcut);
        return isAvailable ? null : item;
      });

      const results = await Promise.all(checks);
      const conflicts = results.filter((item): item is ShortcutItem => item !== null);

      if (conflicts.length > 0) {
        const conflictNames = conflicts.map(c => `${c.name} (${c.globalShortcut})`).join("、");
        addToast({
          title: "以下快捷键被占用，可能无法生效",
          description: conflictNames,
          color: "warning",
          timeout: 5000,
        });
      }
    }
    update({ enableGlobalShortcuts: enabled });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2>快捷键设置</h2>
        <Button size="sm" variant="flat" onPress={reset}>
          恢复默认
        </Button>
      </div>

      <div className="grid grid-cols-[1fr_200px_200px] gap-4 text-sm font-medium text-zinc-500">
        <div>功能说明</div>
        <div>快捷键</div>
        <div>全局快捷键</div>
      </div>

      <div className="space-y-4">
        {shortcuts.map(item => {
          return (
            <div key={item.id} className="grid grid-cols-[1fr_200px_200px] items-center gap-4">
              <div className="text-medium">{item.name}</div>
              <ShortcutKeyInput
                value={item.shortcut}
                onChange={v => handleShortcutChange(item.id, "shortcut", v)}
                shortcutId={item.id}
                shortcutType="shortcut"
              />
              <ShortcutKeyInput
                value={item.globalShortcut}
                onChange={v => handleShortcutChange(item.id, "globalShortcut", v)}
                shortcutId={item.id}
                shortcutType="globalShortcut"
              />
            </div>
          );
        })}
      </div>
      <div className="text-end">
        <Checkbox isSelected={enableGlobalShortcuts} onValueChange={handleToggleGlobalShortcuts}>
          启用全局快捷键
        </Checkbox>
      </div>
    </div>
  );
};

export default ShortcutSettingsPage;
