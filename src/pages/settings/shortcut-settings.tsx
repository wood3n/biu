import React from "react";

import { Checkbox, addToast } from "@heroui/react";
import { useShallow } from "zustand/react/shallow";

import AsyncButton from "@/components/async-button";
import ShortcutKeyInput from "@/components/shortcut-key-input";
import { useShortcutSettings } from "@/store/shortcuts";

const ShortcutSettingsPage = () => {
  const { shortcuts, globalShortcuts, enableGlobalShortcuts, refresh, update, reset } = useShortcutSettings(
    useShallow(state => ({
      shortcuts: state.shortcuts,
      globalShortcuts: state.globalShortcuts,
      enableGlobalShortcuts: state.enableGlobalShortcuts,
      refresh: state.refresh,
      update: state.update,
      reset: state.reset,
    })),
  );

  const handleChangeShortcut = (id: ShortcutCommand, shortcut: string) => {
    const updatedShortcuts = shortcuts.map(s => (s.id === id ? { ...s, shortcut } : s));

    const finalShortcuts = updatedShortcuts.map(s => {
      // 空快捷键不会冲突
      if (!s.shortcut) {
        return { ...s, isConflict: false, error: undefined };
      }
      const existing = updatedShortcuts.find(other => other.id !== s.id && other.shortcut === s.shortcut);
      return {
        ...s,
        isConflict: !!existing,
        error: existing ? `与“${existing.name}”冲突` : undefined,
      };
    });

    update({ shortcuts: finalShortcuts });
  };

  const handleChangeGlobalShortcut = async (id: ShortcutCommand, shortcut: string) => {
    if (shortcut) {
      const existing = globalShortcuts.find(g => g.id !== id && g.shortcut === shortcut);
      if (existing) {
        addToast({
          title: `与${existing.name}冲突`,
          color: "danger",
        });
        return;
      }

      const registerSuccess = await window.electron.registerShortcut({
        id,
        accelerator: shortcut,
      });

      if (!registerSuccess) {
        addToast({
          title: "与系统或其他应用快捷键冲突",
          color: "danger",
        });
        return;
      }
    } else {
      await window.electron.unregisterShortcut(id);
    }
    const newShortcuts = globalShortcuts.map(s =>
      s.id === id ? { ...s, shortcut, isConflict: false, error: undefined } : s,
    );
    update({ globalShortcuts: newShortcuts });
  };

  const handleToggleEnableGlobalShortcut = async (enabled: boolean) => {
    update({
      enableGlobalShortcuts: enabled,
    });

    if (enabled) {
      await window.electron.registerAllShortcuts();
    } else {
      await window.electron.unregisterAllShortcuts();
    }

    await refresh();
  };

  const handleReset = async () => {
    reset();
    await window.electron.registerAllShortcuts();
    await refresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2>快捷键设置</h2>
        <AsyncButton size="sm" radius="md" variant="flat" onPress={handleReset}>
          恢复默认
        </AsyncButton>
      </div>

      <div className="grid grid-cols-[1fr_200px_200px] gap-4 text-sm font-medium text-zinc-500">
        <div>功能说明</div>
        <div>应用内快捷键</div>
        <div>全局快捷键</div>
      </div>

      <div className="space-y-4">
        {shortcuts.map(item => {
          const globalShortcut = globalShortcuts.find(g => g.id === item.id) as ShortcutItem;

          return (
            <div key={item.id} className="grid grid-cols-[1fr_200px_200px] items-start gap-4">
              <div className="text-medium">{item.name}</div>
              <ShortcutKeyInput
                value={item.shortcut}
                onChange={v => handleChangeShortcut(item.id, v)}
                isInvalid={item.isConflict}
                errorMessage={item.error}
              />
              {Boolean(globalShortcut) && (
                <ShortcutKeyInput
                  value={globalShortcut.shortcut}
                  onChange={v => handleChangeGlobalShortcut(globalShortcut.id, v)}
                  isDisabled={!enableGlobalShortcuts}
                  isInvalid={globalShortcut.isConflict}
                  errorMessage="与系统或其他应用快捷键冲突"
                />
              )}
            </div>
          );
        })}
      </div>
      <div className="text-end">
        <Checkbox isSelected={enableGlobalShortcuts} onValueChange={handleToggleEnableGlobalShortcut}>
          启用全局快捷键
        </Checkbox>
      </div>
    </div>
  );
};

export default ShortcutSettingsPage;
