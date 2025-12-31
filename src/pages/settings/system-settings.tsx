import React from "react";
import { Controller } from "react-hook-form";
import type { Control, UseFormSetValue } from "react-hook-form";

import { Button, Divider, Form, Input, Radio, RadioGroup, Select, SelectItem, Slider, Switch } from "@heroui/react";
import { RiArrowRightLongLine } from "@remixicon/react";

import ColorPicker from "@/components/color-picker";
import FontSelect from "@/components/font-select";
import UpdateCheckButton from "@/components/update-check-button";
import { defaultAppSettings } from "@shared/settings/app-settings";

import ImportExport from "./export-import";
import LyricsSettings from "./lyrics-settings";

type SystemSettingsTabProps = {
  appVersion: string;
  audioQuality: AudioQuality;
  control: Control<AppSettings>;
  isUpdateAvailable: boolean;
  latestVersion?: string;
  setValue: UseFormSetValue<AppSettings>;
};

export const SystemSettingsTab = ({
  appVersion,
  audioQuality,
  control,
  isUpdateAvailable,
  latestVersion,
  setValue,
}: SystemSettingsTabProps) => {
  return (
    <Form className="space-y-6">
      <h2>外观</h2>
      {/* 显示模式 */}
      <div className="flex w-full items-center justify-between">
        <div className="mr-6 space-y-1">
          <div className="text-medium font-medium">显示模式</div>
          <div className="text-sm text-zinc-500">选择媒体内容的显示样式</div>
        </div>
        <Controller
          control={control}
          name="displayMode"
          render={({ field }) => (
            <RadioGroup orientation="horizontal" value={field.value} onValueChange={field.onChange}>
              <Radio value="card">卡片</Radio>
              <Radio value="list">列表</Radio>
            </RadioGroup>
          )}
        />
      </div>
      {/* 字体选择 */}
      <div className="flex w-full items-center justify-between">
        <div className="mr-6 space-y-1">
          <div className="text-medium font-medium">字体</div>
          <div className="text-sm text-zinc-500">选择界面显示的字体</div>
        </div>
        <div className="w-[360px]">
          <Controller
            control={control}
            name="fontFamily"
            render={({ field }) => <FontSelect value={field.value} onChange={field.onChange} />}
          />
        </div>
      </div>

      <div className="flex w-full items-center justify-between">
        <div className="mr-6 space-y-1">
          <div className="text-medium font-medium">内容区域颜色</div>
          <div className="text-sm text-zinc-500">更改应用内容区域的颜色</div>
        </div>
        <div className="flex w-[360px] justify-end">
          <Controller
            control={control}
            name="contentBackgroundColor"
            render={({ field }) => (
              <ColorPicker
                presets={[defaultAppSettings.contentBackgroundColor]}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </div>
      </div>

      <div className="flex w-full items-center justify-between">
        <div className="mr-6 space-y-1">
          <div className="text-medium font-medium">布局颜色</div>
          <div className="text-sm text-zinc-500">更改应用布局背景颜色</div>
        </div>
        <div className="flex w-[360px] justify-end">
          <Controller
            control={control}
            name="backgroundColor"
            render={({ field }) => (
              <ColorPicker
                presets={[defaultAppSettings.backgroundColor]}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </div>
      </div>

      <div className="flex w-full items-center justify-between">
        <div className="mr-6 space-y-1">
          <div className="text-medium font-medium">主题颜色</div>
          <div className="text-sm text-zinc-500">更改应用的主色调</div>
        </div>
        <div className="flex w-[360px] justify-end">
          <Controller
            control={control}
            name="primaryColor"
            render={({ field }) => (
              <ColorPicker
                presets={[defaultAppSettings.primaryColor, "#66cc8a", "#9353d3", "#ffffff", "#db924b"]}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </div>
      </div>

      {/* 全局圆角设置 */}
      <div className="flex w-full items-center justify-between">
        <div className="mr-6 space-y-1">
          <div className="text-medium font-medium">圆角</div>
          <div className="text-sm text-zinc-500">调整界面控件的圆角大小</div>
        </div>
        <div className="w-[360px]">
          <Controller
            control={control}
            name="borderRadius"
            render={({ field }) => (
              <Slider
                showTooltip={false}
                size="sm"
                endContent={<span>{field.value}px</span>}
                aria-label="全局圆角"
                value={field.value}
                onChange={v => field.onChange(Number(v))}
                minValue={0}
                maxValue={24}
                step={1}
                classNames={{
                  thumb: "after:hidden",
                }}
              />
            )}
          />
        </div>
      </div>
      <Divider />
      <h2>播放</h2>
      {/* 音质选择 */}
      <div className="flex w-full items-center justify-between">
        <div className="mr-6 space-y-1">
          <div className="text-medium font-medium">音质偏好</div>
          <div className="text-sm text-zinc-500">
            {audioQuality === "auto" && "自动选择最高音质"}
            {audioQuality === "lossless" && "FLAC / Hi-Res"}
            {audioQuality === "high" && "180-320 kbps"}
            {audioQuality === "medium" && "100-140 kbps"}
            {audioQuality === "low" && "60-80 kbps"}
          </div>
        </div>
        <div className="w-[140px]">
          <Controller
            control={control}
            name="audioQuality"
            render={({ field }) => (
              <Select
                aria-label="音质偏好"
                selectedKeys={[field.value]}
                onSelectionChange={keys => {
                  const value = Array.from(keys)[0] as AudioQuality;
                  field.onChange(value);
                }}
              >
                <SelectItem key="auto">自动</SelectItem>
                <SelectItem key="lossless">无损</SelectItem>
                <SelectItem key="high">高品质</SelectItem>
                <SelectItem key="medium">中等</SelectItem>
                <SelectItem key="low">低品质</SelectItem>
              </Select>
            )}
          />
        </div>
      </div>
      <LyricsSettings control={control} />
      <Divider />
      <h2>下载</h2>
      {/* 下载目录配置 */}
      <div className="flex w-full items-center justify-between">
        <div className="mr-6 space-y-1">
          <div className="text-medium font-medium">下载目录</div>
          <div className="text-sm text-zinc-500">选择音视频保存的位置</div>
        </div>
        <div className="w-[360px]">
          <Controller
            control={control}
            name="downloadPath"
            render={({ field }) => (
              <div className="flex items-center space-x-1">
                <Input isDisabled placeholder="选择文件夹" value={field.value} onValueChange={field.onChange} />
                <Button
                  variant="flat"
                  onPress={async () => {
                    const path = await window.electron.selectDirectory();
                    if (path) setValue("downloadPath", path, { shouldDirty: true, shouldTouch: true });
                  }}
                >
                  选择
                </Button>
              </div>
            )}
          />
        </div>
      </div>

      {/* FFmpeg 路径配置 */}
      <div className="flex w-full items-center justify-between">
        <div className="mr-6 space-y-1">
          <div className="text-medium font-medium">FFmpeg 路径</div>
          <div className="text-sm text-zinc-500">手动指定 FFmpeg 可执行文件路径</div>
        </div>
        <div className="w-[360px]">
          <Controller
            control={control}
            name="ffmpegPath"
            render={({ field }) => (
              <div className="flex items-center space-x-1">
                <Input isDisabled placeholder="自动检测" value={field.value} onValueChange={field.onChange} />
                <Button
                  variant="flat"
                  onPress={async () => {
                    const path = await window.electron.selectFile();
                    if (path) setValue("ffmpegPath", path, { shouldDirty: true, shouldTouch: true });
                  }}
                >
                  选择
                </Button>
              </div>
            )}
          />
        </div>
      </div>
      <Divider />
      <h2>系统</h2>
      {/* 窗口关闭选项 */}
      <div className="flex w-full items-center justify-between">
        <div className="mr-6 space-y-1">
          <div className="text-medium font-medium">窗口关闭</div>
          <div className="text-sm text-zinc-500">选择窗口关闭时的行为</div>
        </div>
        <Controller
          control={control}
          name="closeWindowOption"
          render={({ field }) => (
            <RadioGroup orientation="horizontal" value={field.value} onValueChange={field.onChange}>
              <Radio value="hide">隐藏到托盘</Radio>
              <Radio value="exit">直接退出</Radio>
            </RadioGroup>
          )}
        />
      </div>

      {/* 开机自启动开关 */}
      <div className="flex w-full items-center justify-between">
        <div className="mr-6 space-y-1">
          <div className="text-medium font-medium">开机自启动</div>
          <div className="text-sm text-zinc-500">系统登录后自动启动应用</div>
        </div>
        <div className="flex w-[360px] justify-end">
          <Controller
            control={control}
            name="autoStart"
            render={({ field }) => <Switch isSelected={field.value} onValueChange={field.onChange} />}
          />
        </div>
      </div>

      <Divider />
      <h2>关于应用</h2>
      <div className="flex w-full items-center justify-between">
        <div className="mr-6 flex items-center space-x-1">
          <span>当前版本 {appVersion}</span>
          {isUpdateAvailable && Boolean(latestVersion) && (
            <>
              <RiArrowRightLongLine size={16} />
              <span className="text-primary">{latestVersion}</span>
            </>
          )}
        </div>
        <UpdateCheckButton />
      </div>
      <ImportExport />
    </Form>
  );
};
