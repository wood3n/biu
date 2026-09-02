import { useEffect, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";

import { Switch } from "@heroui/react";
import { useShallow } from "zustand/shallow";

import { isHex } from "@/common/utils/color";
import ColorPicker from "@/components/color-picker";
import { useFullScreenPlayerSettings } from "@/store/full-screen-player-settings";
import { usePlayList } from "@/store/play-list";

const FullScreenPlayerSettingsPanel = () => {
  const { playId, list } = usePlayList(
    useShallow(state => ({
      playId: state.playId,
      list: state.list,
    })),
  );
  const playItem = list.find(item => item.id === playId);
  const isLocal = playItem?.source === "local";
  const {
    showLyrics,
    showSpectrum,
    showCover,
    showBlurredBackground,
    backgroundColor,
    spectrumColor,
    lyricsColor,
    update,
  } = useFullScreenPlayerSettings(
    useShallow(s => ({
      showLyrics: s.showLyrics,
      showSpectrum: s.showSpectrum,
      showCover: s.showCover,
      showBlurredBackground: s.showBlurredBackground,
      backgroundColor: s.backgroundColor,
      spectrumColor: s.spectrumColor,
      lyricsColor: s.lyricsColor,
      update: s.update,
    })),
  );

  const { control, setValue } = useForm({
    defaultValues: {
      showLyrics,
      showSpectrum,
      showCover,
      showBlurredBackground,
      backgroundColor,
      spectrumColor,
      lyricsColor,
    },
    mode: "onChange",
  });

  const [lyricsPickerOpen, setLyricsPickerOpen] = useState(false);
  const [spectrumPickerOpen, setSpectrumPickerOpen] = useState(false);
  const [backgroundPickerOpen, setBackgroundPickerOpen] = useState(false);

  useEffect(() => {
    setValue("showLyrics", showLyrics);
    setValue("showSpectrum", showSpectrum);
    setValue("showCover", showCover);
    setValue("showBlurredBackground", showBlurredBackground);
    setValue("backgroundColor", backgroundColor);
    setValue("spectrumColor", spectrumColor);
    setValue("lyricsColor", lyricsColor);
  }, [
    setValue,
    showLyrics,
    showSpectrum,
    showCover,
    showBlurredBackground,
    backgroundColor,
    spectrumColor,
    lyricsColor,
  ]);

  const values = useWatch({ control });

  useEffect(() => {
    if (!values || typeof values !== "object") return;
    update({
      showLyrics: values.showLyrics,
      showSpectrum: values.showSpectrum,
      showCover: values.showCover,
      showBlurredBackground: values.showBlurredBackground,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values?.showLyrics, values?.showSpectrum, values?.showCover, values?.showBlurredBackground, update]);

  useEffect(() => {
    if (!values || typeof values !== "object") return;
    const sanitizeLyricsColor = (v?: string) => (isHex(v) ? v! : "#ffffff");
    const sanitizeSpectrumColor = (v?: string) => (v === "currentColor" || isHex(v) ? v! : "currentColor");
    const sanitizeBackgroundColor = (v?: string) => (isHex(v) ? v! : "#ffffff");
    const id = window.setTimeout(() => {
      update({
        spectrumColor: sanitizeSpectrumColor(values.spectrumColor),
        lyricsColor: sanitizeLyricsColor(values.lyricsColor),
        backgroundColor: sanitizeBackgroundColor(values.backgroundColor),
      });
    }, 200);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values?.spectrumColor, values?.lyricsColor, values?.backgroundColor, update]);

  return (
    <div className="w-[400px] space-y-5 pb-2">
      {/* 显示设置 */}
      <div className="space-y-3">
        <h3 className="text-small font-medium tracking-wider text-white/60 uppercase">显示</h3>
        <div className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-3">
          <Controller
            control={control}
            name="showLyrics"
            render={({ field }) => (
              <>
                <span className="text-medium text-white/90 select-none">歌词</span>
                <Switch isSelected={field.value} onValueChange={field.onChange} />
              </>
            )}
          />
          {values?.showLyrics && (
            <Controller
              control={control}
              name="lyricsColor"
              render={({ field }) => {
                const v = field.value;
                const pickerValue = isHex(v) ? v : "#ffffff";
                return (
                  <>
                    <span className="text-medium pl-4 text-white/90 select-none">歌词颜色</span>
                    <ColorPicker
                      value={pickerValue}
                      onChange={hex => field.onChange(hex)}
                      isOpen={lyricsPickerOpen}
                      onOpenChange={setLyricsPickerOpen}
                    >
                      <div
                        className="h-7 w-10 rounded-full border border-white/20"
                        style={{ backgroundColor: field.value || undefined }}
                      />
                    </ColorPicker>
                  </>
                );
              }}
            />
          )}
          <Controller
            control={control}
            name="showSpectrum"
            render={({ field }) => (
              <>
                <span className="text-medium text-white/90 select-none">频谱图</span>
                <Switch isSelected={field.value} onValueChange={field.onChange} />
              </>
            )}
          />
          {values?.showSpectrum && (
            <Controller
              control={control}
              name="spectrumColor"
              render={({ field }) => {
                const v = field.value;
                const pickerValue = isHex(v) ? v : "#ffffff";
                return (
                  <>
                    <span className="text-medium pl-4 text-white/90 select-none">频谱图颜色</span>
                    <ColorPicker
                      value={pickerValue}
                      onChange={hex => field.onChange(hex)}
                      isOpen={spectrumPickerOpen}
                      onOpenChange={setSpectrumPickerOpen}
                    >
                      <div
                        className="h-7 w-10 rounded-full border border-white/20"
                        style={{ backgroundColor: isHex(v) ? v : undefined }}
                      />
                    </ColorPicker>
                  </>
                );
              }}
            />
          )}
          <Controller
            control={control}
            name="showCover"
            render={({ field }) => (
              <>
                <span className="text-medium text-white/90 select-none">封面</span>
                <Switch isSelected={field.value} onValueChange={field.onChange} isDisabled={isLocal} />
              </>
            )}
          />
          <Controller
            control={control}
            name="showBlurredBackground"
            render={({ field }) => (
              <>
                <span className="text-medium text-white/90 select-none">虚化背景</span>
                <Switch isSelected={field.value} onValueChange={field.onChange} />
              </>
            )}
          />
          {!values?.showBlurredBackground && (
            <Controller
              control={control}
              name="backgroundColor"
              render={({ field }) => (
                <>
                  <span className="text-medium pl-4 text-white/90 select-none">背景颜色</span>
                  <ColorPicker
                    value={field.value}
                    onChange={hex => field.onChange(hex)}
                    isOpen={backgroundPickerOpen}
                    onOpenChange={setBackgroundPickerOpen}
                  >
                    <div
                      className="h-7 w-10 rounded-full border border-white/20"
                      style={{ backgroundColor: field.value }}
                    />
                  </ColorPicker>
                </>
              )}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default FullScreenPlayerSettingsPanel;
