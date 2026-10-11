import React, { useCallback, useEffect, useState } from "react";

import { Button, Divider, Slider, Switch } from "@heroui/react";
import { RiFileTextLine } from "@remixicon/react";

import { defaultDesktopLyricsSettings } from "@shared/settings/desktop-lyrics-settings";

const FONT_SIZE_MIN = 20;
const FONT_SIZE_MAX = 96;
const OPACITY_MIN = 30;
const OPACITY_MAX = 100;

/** 设置页：桌面歌词 */
const DesktopLyricsSettings = () => {
  const [settings, setSettings] = useState<DesktopLyricsSettings>(defaultDesktopLyricsSettings);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let mounted = true;

    void (async () => {
      try {
        const [stored, open] = await Promise.all([
          window.electron.getDesktopLyricsSettings(),
          window.electron.isDesktopLyricsOpen(),
        ]);

        if (!mounted) return;
        if (stored) setSettings(prev => ({ ...prev, ...stored }));
        setVisible(Boolean(open));
      } catch {
        // 忽略读取失败
      }
    })();

    const removeVisibilityListener = window.electron.onDesktopLyricsVisibilityChange(setVisible);
    const removeLockListener = window.electron.onDesktopLyricsLockChange(locked =>
      setSettings(prev => ({ ...prev, locked })),
    );

    return () => {
      mounted = false;
      removeVisibilityListener();
      removeLockListener();
    };
  }, []);

  const updateStyle = useCallback((patch: Partial<DesktopLyricsStyle>) => {
    setSettings(prev => ({ ...prev, ...patch }));
    void window.electron.updateDesktopLyricsStyle(patch);
  }, []);

  const toggleLyrics = useCallback(async () => {
    try {
      const next = await window.electron.toggleDesktopLyrics();
      setVisible(next);
    } catch {
      // 忽略切换失败
    }
  }, []);

  const toggleLocked = useCallback((locked: boolean) => {
    setSettings(prev => ({ ...prev, locked }));
    window.electron.setDesktopLyricsLocked(locked);
  }, []);

  return (
    <div className="space-y-6">
      <h2>桌面歌词</h2>

      <div className="flex w-full items-center justify-between">
        <div className="mr-6 space-y-1">
          <div className="text-medium font-medium">显示桌面歌词</div>
          <div className="text-sm text-zinc-500">
            在桌面上独立显示当前歌词：可拖动位置、拖拽边缘改变大小，播放条与托盘菜单也能快速开关
          </div>
        </div>
        <Button
          color={visible ? "primary" : "default"}
          startContent={<RiFileTextLine size={16} />}
          variant={visible ? "flat" : "bordered"}
          onPress={() => void toggleLyrics()}
        >
          {visible ? "关闭" : "开启"}
        </Button>
      </div>

      <Divider />

      <div className="flex w-full items-center justify-between">
        <div className="mr-6 space-y-1">
          <div className="text-medium font-medium">锁定</div>
          <div className="text-sm text-zinc-500">
            锁定后不显示工具栏且鼠标穿透（点击落到下面的窗口）；把鼠标移到歌词上，可从右上角一键解锁
          </div>
        </div>
        <Switch disableAnimation isSelected={settings.locked} onValueChange={toggleLocked} />
      </div>

      <div className="flex w-full items-center justify-between">
        <div className="mr-6 space-y-1">
          <div className="text-medium font-medium">背景板</div>
          <div className="text-sm text-zinc-500">给歌词加一层半透明底色，浅色壁纸下更好读</div>
        </div>
        <Switch
          disableAnimation
          isSelected={settings.background}
          onValueChange={background => updateStyle({ background })}
        />
      </div>

      <div className="flex w-full items-center justify-between">
        <div className="mr-6 space-y-1">
          <div className="text-medium font-medium">显示翻译</div>
          <div className="text-sm text-zinc-500">有翻译歌词时同时显示译文</div>
        </div>
        <Switch
          disableAnimation
          isSelected={settings.showTranslation}
          onValueChange={showTranslation => updateStyle({ showTranslation })}
        />
      </div>

      <div className="flex w-full items-center justify-between">
        <div className="mr-6 space-y-1">
          <div className="text-medium font-medium">字号</div>
          <div className="text-sm text-zinc-500">当前歌词的字号（也可在歌词窗口工具栏里调）</div>
        </div>
        <div className="w-[360px]">
          <Slider
            showTooltip={false}
            size="sm"
            endContent={<span>{settings.fontSize}px</span>}
            aria-label="桌面歌词字号"
            value={settings.fontSize}
            onChange={fontSize => setSettings(prev => ({ ...prev, fontSize: Number(fontSize) }))}
            onChangeEnd={fontSize => updateStyle({ fontSize: Number(fontSize) })}
            minValue={FONT_SIZE_MIN}
            maxValue={FONT_SIZE_MAX}
            step={2}
            classNames={{ thumb: "after:hidden" }}
          />
        </div>
      </div>

      <div className="flex w-full items-center justify-between">
        <div className="mr-6 space-y-1">
          <div className="text-medium font-medium">不透明度</div>
          <div className="text-sm text-zinc-500">歌词整体的不透明度</div>
        </div>
        <div className="w-[360px]">
          <Slider
            showTooltip={false}
            size="sm"
            endContent={<span>{Math.round(settings.opacity * 100)}%</span>}
            aria-label="桌面歌词不透明度"
            value={Math.round(settings.opacity * 100)}
            onChange={value => setSettings(prev => ({ ...prev, opacity: Number(value) / 100 }))}
            onChangeEnd={value => updateStyle({ opacity: Number(value) / 100 })}
            minValue={OPACITY_MIN}
            maxValue={OPACITY_MAX}
            step={5}
            classNames={{ thumb: "after:hidden" }}
          />
        </div>
      </div>

      <Divider />

      <div className="space-y-2">
        <div className="text-medium font-medium">歌词来源</div>
        <div className="text-default-500 text-sm leading-relaxed">
          按「本地缓存 → 网易云音乐自动匹配 → LRCLIB → B
          站字幕」的顺序获取；如果匹配得不准或者没有歌词，可以在歌词窗口里点「选歌词」手动搜索指定。
        </div>
      </div>
    </div>
  );
};

export default DesktopLyricsSettings;
