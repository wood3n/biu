import { Controller } from "react-hook-form";
import type { Control } from "react-hook-form";

import { Form, Slider, Switch, Tab, Tabs } from "@heroui/react";

import {
  DESKTOP_LYRICS_FONT_SIZE_MAX,
  DESKTOP_LYRICS_FONT_SIZE_MIN,
  DESKTOP_LYRICS_FONT_SIZE_STEP,
  DESKTOP_LYRICS_WIDTH_MAX,
  DESKTOP_LYRICS_WIDTH_MIN,
  DESKTOP_LYRICS_WIDTH_STEP,
} from "@/common/utils/desktop-lyrics";
import FontSelect from "@/components/font-select";
import { defaultAppSettings } from "@shared/settings/app-settings";

import { ColorItem } from "./color-settings";

type DesktopLyricsSettingsTabProps = {
  control: Control<AppSettings>;
};

export const DesktopLyricsSettingsTab = ({ control }: DesktopLyricsSettingsTabProps) => {
  return (
    <Form className="space-y-6">
      <h2>显示</h2>
      {/* 桌面歌词开关 */}
      <div className="flex w-full items-center justify-between">
        <div className="mr-6 space-y-1">
          <div className="text-medium font-medium">显示桌面歌词</div>
          <div className="text-sm text-zinc-500">在桌面顶层显示当前歌词，鼠标移到歌词上可拖动</div>
        </div>
        <Controller
          control={control}
          name="desktopLyricsEnabled"
          render={({ field }) => <Switch disableAnimation isSelected={field.value} onValueChange={field.onChange} />}
        />
      </div>
      {/* 桌面歌词锁定 */}
      <div className="flex w-full items-center justify-between">
        <div className="mr-6 space-y-1">
          <div className="text-medium font-medium">锁定桌面歌词</div>
          <div className="text-sm text-zinc-500">锁定后完全鼠标穿透，歌词位置保持不变</div>
        </div>
        <Controller
          control={control}
          name="desktopLyricsLocked"
          render={({ field }) => <Switch disableAnimation isSelected={field.value} onValueChange={field.onChange} />}
        />
      </div>
      {/* 桌面歌词显示模式 */}
      <div className="flex w-full items-center justify-between">
        <div className="mr-6 space-y-1">
          <div className="text-medium font-medium">显示行数</div>
          <div className="text-sm text-zinc-500">单行只显示当前句，双行同时显示当前句与下一句并上下轮换</div>
        </div>
        <Controller
          control={control}
          name="desktopLyricsLineMode"
          render={({ field }) => (
            <Tabs
              aria-label="桌面歌词行数"
              classNames={{
                cursor: "rounded-medium",
                tabList: "bg-default-200/80 dark:bg-default-100/10",
              }}
              selectedKey={field.value}
              onSelectionChange={key => field.onChange(key)}
            >
              <Tab key="single" title="单行" />
              <Tab key="double" title="双行" />
            </Tabs>
          )}
        />
      </div>

      {/* 桌面歌词一行最大宽度 */}
      <div className="flex w-full items-center justify-between">
        <div className="mr-6 space-y-1">
          <div className="text-medium font-medium">最大宽度</div>
          <div className="text-sm text-zinc-500">一行歌词最多占多少屏幕宽度，装不下的长歌词改为自动滚动</div>
        </div>
        <div className="w-[180px]">
          <Controller
            control={control}
            name="desktopLyricsWidth"
            render={({ field }) => (
              <Slider
                showTooltip={false}
                size="sm"
                endContent={<span className="tabular-nums">{field.value}%</span>}
                aria-label="桌面歌词最大宽度"
                value={field.value}
                onChange={v => field.onChange(Number(v))}
                minValue={DESKTOP_LYRICS_WIDTH_MIN}
                maxValue={DESKTOP_LYRICS_WIDTH_MAX}
                step={DESKTOP_LYRICS_WIDTH_STEP}
                classNames={{
                  thumb: "after:hidden",
                }}
              />
            )}
          />
        </div>
      </div>

      <h2>外观</h2>
      {/* 桌面歌词字体 */}
      <div className="flex w-full items-center justify-between">
        <div className="mr-6 space-y-1">
          <div className="text-medium font-medium">字体</div>
          <div className="text-sm text-zinc-500">歌词条文字使用的字体</div>
        </div>
        <div className="w-[180px]">
          <Controller
            control={control}
            name="desktopLyricsFontFamily"
            render={({ field }) => <FontSelect value={field.value} onChange={field.onChange} />}
          />
        </div>
      </div>
      {/* 桌面歌词字号 */}
      <div className="flex w-full items-center justify-between">
        <div className="mr-6 space-y-1">
          <div className="text-medium font-medium">字号</div>
          <div className="text-sm text-zinc-500">超出屏幕的长歌词会自动滚动</div>
        </div>
        <div className="w-[180px]">
          <Controller
            control={control}
            name="desktopLyricsFontSize"
            render={({ field }) => (
              <Slider
                showTooltip={false}
                size="sm"
                endContent={<span className="tabular-nums">{field.value}px</span>}
                aria-label="桌面歌词字号"
                value={field.value}
                onChange={v => field.onChange(Number(v))}
                minValue={DESKTOP_LYRICS_FONT_SIZE_MIN}
                maxValue={DESKTOP_LYRICS_FONT_SIZE_MAX}
                step={DESKTOP_LYRICS_FONT_SIZE_STEP}
                classNames={{
                  thumb: "after:hidden",
                }}
              />
            )}
          />
        </div>
      </div>
      {/* 桌面歌词颜色 */}
      <div className="flex w-full items-center justify-between">
        <div className="mr-6 space-y-1">
          <div className="text-medium font-medium">颜色</div>
          <div className="text-sm text-zinc-500">未唱部分与已唱高亮部分的文字颜色</div>
        </div>
        <div className="flex gap-3">
          <Controller
            control={control}
            name="desktopLyricsColor"
            render={({ field }) => (
              <ColorItem label="未唱" value={field.value} onChange={v => field.onChange(v)} presets={["#ffffff"]} />
            )}
          />
          <Controller
            control={control}
            name="desktopLyricsActiveColor"
            render={({ field }) => (
              <ColorItem
                label="已唱"
                value={field.value}
                onChange={v => field.onChange(v)}
                presets={[defaultAppSettings.desktopLyricsActiveColor]}
              />
            )}
          />
        </div>
      </div>
    </Form>
  );
};
