import React from "react";
import { Controller } from "react-hook-form";
import type { Control, UseFormSetValue } from "react-hook-form";

import { Button, Divider, Form, Select, SelectItem } from "@heroui/react";
import { RiArrowRightLongLine } from "@remixicon/react";

import ColorPicker from "@/components/color-picker";
import FontSelect from "@/components/font-select";
import UpdateCheckButton from "@/components/update-check-button";
import { defaultAppSettings } from "@shared/settings/app-settings";

import ImportExport from "./export-import";

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
      {/* 主题模式 */}
      <div className="flex w-full items-center justify-between">
        <div className="mr-6 space-y-1">
          <div className="text-medium font-medium">主题模式</div>
          <div className="text-sm text-zinc-500">选择浅色或深色主题</div>
        </div>
        <div className="w-[180px]">
          <Controller
            control={control}
            name="themeMode"
            render={({ field }) => (
              <Select
                aria-label="主题模式"
                selectedKeys={field.value ? new Set([field.value]) : new Set()}
                onSelectionChange={keys => {
                  const value = Array.from(keys)[0] as string;
                  field.onChange(value);
                }}
              >
                <SelectItem key="light">浅色</SelectItem>
                <SelectItem key="dark">深色</SelectItem>
              </Select>
            )}
          />
        </div>
      </div>
      {/* 显示模式 */}
      <div className="flex w-full items-center justify-between">
        <div className="mr-6 space-y-1">
          <div className="text-medium font-medium">显示模式</div>
          <div className="text-sm text-zinc-500">选择媒体内容的显示样式</div>
        </div>
        <div className="w-[180px]">
          <Controller
            control={control}
            name="displayMode"
            render={({ field }) => (
              <Select
                aria-label="显示模式"
                selectedKeys={field.value ? new Set([field.value]) : new Set()}
                onSelectionChange={keys => {
                  const value = Array.from(keys)[0] as string;
                  field.onChange(value);
                }}
              >
                <SelectItem key="card">卡片</SelectItem>
                <SelectItem key="list">列表</SelectItem>
              </Select>
            )}
          />
        </div>
      </div>
      {/* 字体选择 */}
      <div className="flex w-full items-center justify-between">
        <div className="mr-6 space-y-1">
          <div className="text-medium font-medium">字体</div>
          <div className="text-sm text-zinc-500">选择界面显示的字体</div>
        </div>
        <div className="w-[180px]">
          <Controller
            control={control}
            name="fontFamily"
            render={({ field }) => <FontSelect value={field.value} onChange={field.onChange} />}
          />
        </div>
      </div>

      {/* 页面切换动画 */}
      <div className="flex w-full items-center justify-between">
        <div className="mr-6 space-y-1">
          <div className="text-medium font-medium">页面切换动画</div>
          <div className="text-sm text-zinc-500">选择页面切换时的过渡效果</div>
        </div>
        <div className="w-[180px]">
          <Controller
            control={control}
            name="pageTransition"
            render={({ field }) => (
              <Select
                aria-label="页面切换动画"
                selectedKeys={field.value ? new Set([field.value]) : new Set()}
                onSelectionChange={keys => {
                  const value = Array.from(keys)[0] as PageTransition;
                  field.onChange(value);
                }}
              >
                <SelectItem key="none">无动画</SelectItem>
                <SelectItem key="fade">淡入淡出</SelectItem>
                <SelectItem key="slide">滑动</SelectItem>
                <SelectItem key="scale">缩放</SelectItem>
                <SelectItem key="slideUp">上浮</SelectItem>
              </Select>
            )}
          />
        </div>
      </div>

      <div className="flex w-full items-center justify-between">
        <div className="mr-6 space-y-1">
          <div className="text-medium font-medium">主色调</div>
          <div className="text-sm text-zinc-500">自定义应用的强调色</div>
        </div>
        <div className="flex w-[180px] justify-end">
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
        <div className="w-[180px]">
          <Controller
            control={control}
            name="audioQuality"
            render={({ field }) => (
              <Select
                aria-label="音质偏好"
                selectedKeys={field.value ? new Set([field.value]) : new Set()}
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

      {/* 点击封面显示音乐频谱 */}
      <div className="flex w-full items-center justify-between">
        <div className="mr-6 space-y-1">
          <div className="text-medium font-medium">音乐频谱</div>
          <div className="text-sm text-zinc-500">点击歌曲封面显示音乐频谱</div>
        </div>
        <Controller
          control={control}
          name="enableWaveformOnClick"
          render={({ field }) => (
            <Button
              className="w-[80px]"
              variant={field.value ? "solid" : "bordered"}
              color={field.value ? "primary" : "default"}
              onPress={() => field.onChange(!field.value)}
            >
              {field.value ? "已启用" : "未启用"}
            </Button>
          )}
        />
      </div>
      <Divider />
      <h2>下载</h2>
      {/* 下载目录配置 */}
      <Controller
        control={control}
        name="downloadPath"
        render={({ field }) => (
          <div className="flex w-full items-center justify-between">
            <div className="mr-6 space-y-1">
              <div className="text-medium font-medium">下载目录</div>
              <div className="text-sm text-zinc-500">{field.value || "选择音视频保存的位置"}</div>
            </div>
            <Button
              variant="flat"
              onPress={async () => {
                const path = await window.electron.selectDirectory();
                if (path) setValue("downloadPath", path, { shouldDirty: true, shouldTouch: true });
              }}
            >
              更改
            </Button>
          </div>
        )}
      />

      {/* FFmpeg 路径配置 */}
      <Controller
        control={control}
        name="ffmpegPath"
        render={({ field }) => (
          <div className="flex w-full items-center justify-between">
            <div className="mr-6 space-y-1">
              <div className="text-medium font-medium">FFmpeg 路径</div>
              <div className="text-sm text-zinc-500">{field.value || "手动指定 FFmpeg 可执行文件路径"}</div>
            </div>
            <Button
              variant="flat"
              onPress={async () => {
                const path = await window.electron.selectFile();
                if (path) setValue("ffmpegPath", path, { shouldDirty: true, shouldTouch: true });
              }}
            >
              更改
            </Button>
          </div>
        )}
      />
      <Divider />
      <h2>搜索</h2>
      {/* 仅音乐过滤 */}
      <div className="flex w-full items-center justify-between">
        <div className="mr-6 space-y-1">
          <div className="text-medium font-medium">仅音乐</div>
          <div className="text-sm text-zinc-500">搜索视频时仅显示音乐分区内容</div>
        </div>
        <Controller
          control={control}
          name="searchMusicOnly"
          render={({ field }) => (
            <Button
              className="w-[80px]"
              variant={field.value ? "solid" : "bordered"}
              color={field.value ? "primary" : "default"}
              onPress={() => field.onChange(!field.value)}
            >
              {field.value ? "已启用" : "未启用"}
            </Button>
          )}
        />
      </div>
      {/* 显示搜索历史 */}
      <div className="flex w-full items-center justify-between">
        <div className="mr-6 space-y-1">
          <div className="text-medium font-medium">显示搜索历史</div>
          <div className="text-sm text-zinc-500">在搜索框中显示搜索历史记录</div>
        </div>
        <Controller
          control={control}
          name="showSearchHistory"
          render={({ field }) => (
            <Button
              className="w-[80px]"
              variant={field.value ? "solid" : "bordered"}
              color={field.value ? "primary" : "default"}
              onPress={() => field.onChange(!field.value)}
            >
              {field.value ? "已启用" : "未启用"}
            </Button>
          )}
        />
      </div>

      <Divider />
      <h2>系统</h2>
      {/* 窗口关闭选项 */}
      <div className="flex w-full items-center justify-between">
        <div className="mr-6 space-y-1">
          <div className="text-medium font-medium">窗口关闭</div>
          <div className="text-sm text-zinc-500">选择窗口关闭时的行为</div>
        </div>
        <div className="w-[180px]">
          <Controller
            control={control}
            name="closeWindowOption"
            render={({ field }) => (
              <Select
                aria-label="窗口关闭"
                selectedKeys={field.value ? new Set([field.value]) : new Set()}
                onSelectionChange={keys => {
                  const value = Array.from(keys)[0] as string;
                  field.onChange(value);
                }}
              >
                <SelectItem key="hide">隐藏到托盘</SelectItem>
                <SelectItem key="exit">直接退出</SelectItem>
              </Select>
            )}
          />
        </div>
      </div>

      {/* 开机自启动开关 */}
      <div className="flex w-full items-center justify-between">
        <div className="mr-6 space-y-1">
          <div className="text-medium font-medium">开机自启动</div>
          <div className="text-sm text-zinc-500">系统登录后自动启动应用</div>
        </div>
        <Controller
          control={control}
          name="autoStart"
          render={({ field }) => (
            <Button
              className="w-[80px]"
              variant={field.value ? "solid" : "bordered"}
              color={field.value ? "primary" : "default"}
              onPress={() => field.onChange(!field.value)}
            >
              {field.value ? "已启用" : "未启用"}
            </Button>
          )}
        />
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
        <div className="flex w-[64px] justify-end">
          <UpdateCheckButton />
        </div>
      </div>
      <ImportExport />
    </Form>
  );
};
