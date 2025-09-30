import React, { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";

import { Form, Input, Slider, Switch, Button, RadioGroup, Radio, Divider } from "@heroui/react";

import ColorPicker from "@/components/color-picker";
import FontSelect from "@/components/font-select";
import ScrollContainer from "@/components/scroll-container";
import { useSettings } from "@/store/settings";

type SettingsForm = {
  fontFamily: string;
  color: string;
  borderRadius: number;
  downloadPath: string;
  closeWindowOption: "hide" | "exit";
  autoStart: boolean;
};

const SettingsPage: React.FC = () => {
  const { fontFamily, color, borderRadius, downloadPath, closeWindowOption, autoStart, update } = useSettings();

  const { control, watch, setValue } = useForm<SettingsForm>({
    defaultValues: { fontFamily, color, borderRadius, downloadPath, closeWindowOption, autoStart },
  });

  // 表单项变化时自动保存到 store（即改即存）
  useEffect(() => {
    const subscription = watch(values => {
      update(values);
    });
    return () => subscription.unsubscribe();
  }, [watch, update]);

  return (
    <ScrollContainer className="h-full w-full">
      <div className="m-auto max-w-[900px] px-8 py-6">
        <Form className="space-y-6">
          <h1>设置</h1>
          <h2>外观</h2>
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
                render={({ field }) => <FontSelect color="secondary" value={field.value} onChange={field.onChange} />}
              />
            </div>
          </div>

          {/* 主题颜色配置 */}
          <div className="flex w-full items-center justify-between">
            <div className="mr-6 space-y-1">
              <div className="text-medium font-medium">主题颜色</div>
              <div className="text-sm text-zinc-500">更改应用的主色调</div>
            </div>
            <div className="flex w-[360px] justify-end">
              <Controller
                control={control}
                name="color"
                render={({ field }) => <ColorPicker value={field.value} onChange={field.onChange} />}
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
                    disableAnimation
                    disableThumbScale
                    showTooltip
                    tooltipProps={{
                      isOpen: true,
                      disableAnimation: true,
                      showArrow: false,
                      content: `${field.value}px`,
                    }}
                    size="sm"
                    aria-label="全局圆角"
                    value={field.value}
                    onChange={v => field.onChange(Number(v))}
                    minValue={0}
                    maxValue={24}
                    step={1}
                    classNames={{
                      thumb: "w-4 h-4 after:w-4 after:h-4 after:bg-foreground",
                    }}
                  />
                )}
              />
            </div>
          </div>
          <Divider />
          <h2>系统</h2>
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
                    <Input
                      color="secondary"
                      isDisabled
                      placeholder="选择文件夹"
                      value={field.value}
                      onValueChange={field.onChange}
                    />
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
        </Form>
      </div>
    </ScrollContainer>
  );
};

export default SettingsPage;
