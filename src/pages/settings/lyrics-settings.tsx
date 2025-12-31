import React from "react";
import { Controller, useWatch } from "react-hook-form";
import type { Control } from "react-hook-form";

import { Button, Divider, Input, Radio, RadioGroup, Slider, Switch } from "@heroui/react";

import { StoreNameMap } from "@shared/store";

type LyricsSettingsProps = {
  control: Control<AppSettings>;
};

const LyricsSettings = ({ control }: LyricsSettingsProps) => {
  const lyricsProvider = useWatch({ control, name: "lyricsProvider" });
  const lyricsTitleResolverEnabled = useWatch({ control, name: "lyricsTitleResolverEnabled" });
  const lyricsTitleResolverProvider = useWatch({ control, name: "lyricsTitleResolverProvider" });
  const lyricsOverlayFontSize = useWatch({ control, name: "lyricsOverlayFontSize" });
  const lyricsOverlayOpacity = useWatch({ control, name: "lyricsOverlayOpacity" });
  const lyricsOverlayContentMaxWidth = useWatch({ control, name: "lyricsOverlayContentMaxWidth" });
  const lyricsOverlayContentHeight = useWatch({ control, name: "lyricsOverlayContentHeight" });

  return (
    <>
      <Divider />
      <h2>桌面歌词</h2>
      <div className="flex w-full items-center justify-between">
        <div className="mr-6 space-y-1">
          <div className="text-medium font-medium">启用桌面歌词</div>
          <div className="text-sm text-zinc-500">播放时在桌面置顶窗口显示滚动歌词</div>
        </div>
        <div className="flex w-[360px] justify-end">
          <Controller
            control={control}
            name="lyricsOverlayEnabled"
            render={({ field }) => <Switch isSelected={field.value} onValueChange={field.onChange} />}
          />
        </div>
      </div>

      <div className="flex w-full items-center justify-between">
        <div className="mr-6 space-y-1">
          <div className="text-medium font-medium">自动打开</div>
          <div className="text-sm text-zinc-500">切歌/开始播放时自动打开桌面歌词窗口</div>
        </div>
        <div className="flex w-[360px] justify-end">
          <Controller
            control={control}
            name="lyricsOverlayAutoShow"
            render={({ field }) => <Switch isSelected={field.value} onValueChange={field.onChange} />}
          />
        </div>
      </div>

      <div className="flex w-full items-center justify-between">
        <div className="mr-6 space-y-1">
          <div className="text-medium font-medium">歌词来源</div>
          <div className="text-sm text-zinc-500">默认使用网易云音乐搜索并获取带时间戳的 LRC</div>
        </div>
        <div className="flex w-[360px] justify-end">
          <Controller
            control={control}
            name="lyricsProvider"
            render={({ field }) => (
              <RadioGroup orientation="horizontal" value={field.value} onValueChange={field.onChange}>
                <Radio value="netease">网易云音乐</Radio>
                <Radio value="custom">自定义</Radio>
              </RadioGroup>
            )}
          />
        </div>
      </div>

      {lyricsProvider === "netease" ? (
        <div className="flex w-full items-center justify-between">
          <div className="mr-6 space-y-1">
            <div className="text-medium font-medium">网易云：搜索 URL 模板</div>
            <div className="text-sm text-zinc-500">占位符：{`{query}`}（用于搜索 songId）</div>
          </div>
          <div className="w-[360px]">
            <Controller
              control={control}
              name="neteaseSearchUrlTemplate"
              render={({ field }) => (
                <Input
                  placeholder="https://music.163.com/api/search/get?s={query}&type=1&limit=1&offset=0"
                  value={field.value}
                  onValueChange={field.onChange}
                />
              )}
            />
          </div>
        </div>
      ) : null}

      {lyricsProvider === "netease" ? (
        <div className="flex w-full items-center justify-between">
          <div className="mr-6 space-y-1">
            <div className="text-medium font-medium">网易云：歌词 URL 模板</div>
            <div className="text-sm text-zinc-500">占位符：{`{id}`}（用于获取 LRC）</div>
          </div>
          <div className="w-[360px]">
            <Controller
              control={control}
              name="neteaseLyricUrlTemplate"
              render={({ field }) => (
                <Input
                  placeholder="https://music.163.com/api/song/lyric?os=pc&id={id}&lv=-1&kv=-1&tv=-1"
                  value={field.value}
                  onValueChange={field.onChange}
                />
              )}
            />
          </div>
        </div>
      ) : null}

      <div className="flex w-full items-center justify-between">
        <div className="mr-6 space-y-1">
          <div className="text-medium font-medium">歌名纠正（AI/服务）</div>
          <div className="text-sm text-zinc-500">
            播放前用外部服务把标题纠正为“真实歌名”，并缓存到本地（下次不再调用）
          </div>
        </div>
        <div className="flex w-[360px] justify-end">
          <Controller
            control={control}
            name="lyricsTitleResolverEnabled"
            render={({ field }) => <Switch isSelected={field.value} onValueChange={field.onChange} />}
          />
        </div>
      </div>

      {lyricsTitleResolverEnabled ? (
        <div className="flex w-full items-center justify-between">
          <div className="mr-6 space-y-1">
            <div className="text-medium font-medium">纠正方式</div>
            <div className="text-sm text-zinc-500">Ark 参数在下方配置并保存在本地设置</div>
          </div>
          <div className="flex w-[360px] justify-end">
            <Controller
              control={control}
              name="lyricsTitleResolverProvider"
              render={({ field }) => (
                <RadioGroup orientation="horizontal" value={field.value} onValueChange={field.onChange}>
                  <Radio value="ark">Ark / Doubao</Radio>
                  <Radio value="custom">自定义</Radio>
                </RadioGroup>
              )}
            />
          </div>
        </div>
      ) : null}

      {lyricsTitleResolverEnabled && lyricsTitleResolverProvider === "ark" ? (
        <>
          <div className="flex w-full items-center justify-between">
            <div className="mr-6 space-y-1">
              <div className="text-medium font-medium">Ark API Key</div>
              <div className="text-sm text-zinc-500">用于调用 Ark/Doubao 模型（必填）</div>
            </div>
            <div className="w-[360px]">
              <Controller
                control={control}
                name="lyricsArkApiKey"
                render={({ field }) => (
                  <Input
                    placeholder="请输入 ARK_API_KEY"
                    type="password"
                    value={field.value}
                    onValueChange={field.onChange}
                  />
                )}
              />
            </div>
          </div>

          <div className="flex w-full items-center justify-between">
            <div className="mr-6 space-y-1">
              <div className="text-medium font-medium">Ark 模型</div>
              <div className="text-sm text-zinc-500">默认：doubao-seed-1-6-251015</div>
            </div>
            <div className="w-[360px]">
              <Controller
                control={control}
                name="lyricsArkModel"
                render={({ field }) => (
                  <Input placeholder="doubao-seed-1-6-251015" value={field.value} onValueChange={field.onChange} />
                )}
              />
            </div>
          </div>

          <div className="flex w-full items-center justify-between">
            <div className="mr-6 space-y-1">
              <div className="text-medium font-medium">Ark Endpoint</div>
              <div className="text-sm text-zinc-500">默认：ark.cn-beijing.volces.com</div>
            </div>
            <div className="w-[360px]">
              <Controller
                control={control}
                name="lyricsArkEndpoint"
                render={({ field }) => (
                  <Input
                    placeholder="https://ark.cn-beijing.volces.com/api/v3/chat/completions"
                    value={field.value}
                    onValueChange={field.onChange}
                  />
                )}
              />
            </div>
          </div>

          <div className="flex w-full items-center justify-between">
            <div className="mr-6 space-y-1">
              <div className="text-medium font-medium">reasoning_effort</div>
              <div className="text-sm text-zinc-500">建议值：low / medium / high</div>
            </div>
            <div className="w-[360px]">
              <Controller
                control={control}
                name="lyricsArkReasoningEffort"
                render={({ field }) => (
                  <Input placeholder="medium" value={field.value} onValueChange={field.onChange} />
                )}
              />
            </div>
          </div>
        </>
      ) : null}

      {lyricsTitleResolverEnabled && lyricsTitleResolverProvider === "custom" ? (
        <div className="flex w-full items-center justify-between">
          <div className="mr-6 space-y-1">
            <div className="text-medium font-medium">纠正服务 URL 模板</div>
            <div className="text-sm text-zinc-500">
              支持占位符：{`{title}`}/{`{artist}`}/{`{query}`}；返回纯文本或 JSON（title/name/songName）
            </div>
          </div>
          <div className="w-[360px]">
            <Controller
              control={control}
              name="lyricsTitleResolverUrlTemplate"
              render={({ field }) => (
                <Input
                  placeholder="https://example.com/resolve-title?query={query}"
                  value={field.value}
                  onValueChange={field.onChange}
                />
              )}
            />
          </div>
        </div>
      ) : null}

      <div className="flex w-full items-center justify-between">
        <div className="mr-6 space-y-1">
          <div className="text-medium font-medium">歌词缓存</div>
          <div className="text-sm text-zinc-500">清空本地歌词/歌名映射/偏移缓存</div>
        </div>
        <div className="flex w-[360px] justify-end">
          <Button variant="flat" onPress={() => window.electron.clearStore(StoreNameMap.LyricsCache)}>
            清空缓存
          </Button>
        </div>
      </div>

      {lyricsProvider === "custom" ? (
        <div className="flex w-full items-center justify-between">
          <div className="mr-6 space-y-1">
            <div className="text-medium font-medium">歌词 API URL 模板</div>
            <div className="text-sm text-zinc-500">
              支持占位符：{`{title}`}/{`{artist}`}/{`{query}`}（返回 LRC 文本或 JSON 也可）
            </div>
          </div>
          <div className="w-[360px]">
            <Controller
              control={control}
              name="lyricsApiUrlTemplate"
              render={({ field }) => (
                <Input
                  placeholder="https://example.com/lyrics?title={title}&artist={artist}"
                  value={field.value}
                  onValueChange={field.onChange}
                />
              )}
            />
          </div>
        </div>
      ) : null}

      <div className="flex w-full items-center justify-between">
        <div className="mr-6 space-y-1">
          <div className="text-medium font-medium">歌词字体大小</div>
          <div className="text-sm text-zinc-500">{lyricsOverlayFontSize}px</div>
        </div>
        <div className="w-[360px]">
          <Controller
            control={control}
            name="lyricsOverlayFontSize"
            render={({ field }) => (
              <Slider
                showTooltip={false}
                size="sm"
                endContent={<span>{field.value}px</span>}
                aria-label="歌词字体大小"
                value={field.value}
                onChange={v => field.onChange(Number(v))}
                minValue={12}
                maxValue={32}
                step={1}
                classNames={{ thumb: "after:hidden" }}
              />
            )}
          />
        </div>
      </div>

      <div className="flex w-full items-center justify-between">
        <div className="mr-6 space-y-1">
          <div className="text-medium font-medium">窗口透明度</div>
          <div className="text-sm text-zinc-500">{Math.round((lyricsOverlayOpacity ?? 0) * 100)}%</div>
        </div>
        <div className="w-[360px]">
          <Controller
            control={control}
            name="lyricsOverlayOpacity"
            render={({ field }) => (
              <Slider
                showTooltip={false}
                size="sm"
                endContent={<span>{Math.round(field.value * 100)}%</span>}
                aria-label="桌面歌词透明度"
                value={field.value}
                onChange={v => field.onChange(Number(v))}
                minValue={0.2}
                maxValue={1}
                step={0.05}
                classNames={{ thumb: "after:hidden" }}
              />
            )}
          />
        </div>
      </div>

      <div className="flex w-full items-center justify-between">
        <div className="mr-6 space-y-1">
          <div className="text-medium font-medium">歌词区域宽度</div>
          <div className="text-sm text-zinc-500">{lyricsOverlayContentMaxWidth}px</div>
        </div>
        <div className="w-[360px]">
          <Controller
            control={control}
            name="lyricsOverlayContentMaxWidth"
            render={({ field }) => (
              <Slider
                showTooltip={false}
                size="sm"
                endContent={<span>{field.value}px</span>}
                aria-label="歌词区域宽度"
                value={field.value}
                onChange={v => field.onChange(Number(v))}
                minValue={320}
                maxValue={1400}
                step={20}
                classNames={{ thumb: "after:hidden" }}
              />
            )}
          />
        </div>
      </div>

      <div className="flex w-full items-center justify-between">
        <div className="mr-6 space-y-1">
          <div className="text-medium font-medium">歌词区域高度</div>
          <div className="text-sm text-zinc-500">{lyricsOverlayContentHeight}px</div>
        </div>
        <div className="w-[360px]">
          <Controller
            control={control}
            name="lyricsOverlayContentHeight"
            render={({ field }) => (
              <Slider
                showTooltip={false}
                size="sm"
                endContent={<span>{field.value}px</span>}
                aria-label="歌词区域高度"
                value={field.value}
                onChange={v => field.onChange(Number(v))}
                minValue={60}
                maxValue={300}
                step={5}
                classNames={{ thumb: "after:hidden" }}
              />
            )}
          />
        </div>
      </div>

      <div className="flex w-full items-center justify-between">
        <div className="mr-6 space-y-1">
          <div className="text-medium font-medium">窗口控制</div>
          <div className="text-sm text-zinc-500">手动打开/关闭桌面歌词窗口</div>
        </div>
        <div className="flex w-[360px] justify-end space-x-2">
          <Button variant="flat" onPress={() => window.electron.openLyricsOverlay()}>
            打开
          </Button>
          <Button variant="flat" onPress={() => window.electron.closeLyricsOverlay()}>
            关闭
          </Button>
        </div>
      </div>
    </>
  );
};

export default LyricsSettings;
