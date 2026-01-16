import { useEffect, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";

import { Switch } from "@heroui/react";
import { useShallow } from "zustand/shallow";

import ColorPicker from "@/components/color-picker";
import { useFullScreenPlayerSettings } from "@/store/full-screen-player-settings";

const FullScreenPlayerSettingsPanel = ({ isUiVisible = true }: { isUiVisible?: boolean }) => {
  const {
    showLyrics,
    showSpectrum,
    showCover,
    showBlurredBackground,
    bgThemeMode,
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
      bgThemeMode: s.bgThemeMode,
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
      bgThemeMode,
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
    if (!isUiVisible) {
      setLyricsPickerOpen(false);
      setSpectrumPickerOpen(false);
      setBackgroundPickerOpen(false);
    }
  }, [isUiVisible]);

  useEffect(() => {
    setValue("showLyrics", showLyrics);
    setValue("showSpectrum", showSpectrum);
    setValue("showCover", showCover);
    setValue("showBlurredBackground", showBlurredBackground);
    setValue("bgThemeMode", bgThemeMode);
    setValue("backgroundColor", backgroundColor);
    setValue("spectrumColor", spectrumColor);
    setValue("lyricsColor", lyricsColor);
  }, [
    setValue,
    showLyrics,
    showSpectrum,
    showCover,
    showBlurredBackground,
    bgThemeMode,
    backgroundColor,
    spectrumColor,
    lyricsColor,
  ]);

  const values = useWatch({ control });

  useEffect(() => {
    if (!values || typeof values !== "object") return;
    update({
      showLyrics: Boolean((values as any).showLyrics),
      showSpectrum: Boolean((values as any).showSpectrum),
      showCover: Boolean((values as any).showCover),
      showBlurredBackground: Boolean((values as any).showBlurredBackground),
      bgThemeMode: (values as any).bgThemeMode === "light" ? "light" : "dark",
    } as any);
  }, [
    values?.showLyrics,
    values?.showSpectrum,
    values?.showCover,
    values?.showBlurredBackground,
    values?.bgThemeMode,
    update,
  ]);

  useEffect(() => {
    if (!values || typeof values !== "object") return;
    const isHex = (v?: string) => /^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/.test(v || "");
    const sanitizeLyricsColor = (v?: string) => (isHex(v) ? v! : "#ffffff");
    const sanitizeSpectrumColor = (v?: string) => (v === "currentColor" || isHex(v) ? v! : "currentColor");
    const sanitizeBackgroundColor = (v?: string, mode?: "light" | "dark") =>
      isHex(v) ? v! : mode === "light" ? "#ffffff" : "#000000";
    const id = window.setTimeout(() => {
      update({
        spectrumColor: sanitizeSpectrumColor((values as any).spectrumColor),
        lyricsColor: sanitizeLyricsColor((values as any).lyricsColor),
        backgroundColor: sanitizeBackgroundColor((values as any).backgroundColor, (values as any).bgThemeMode),
      } as any);
    }, 200);
    return () => window.clearTimeout(id);
  }, [values?.spectrumColor, values?.lyricsColor, values?.backgroundColor, values?.bgThemeMode, update]);

  return (
    <div className="min-w-[320px] space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-medium mr-6">显示歌词</div>
        <Controller
          control={control}
          name="showLyrics"
          render={({ field }) => <Switch isSelected={field.value} onValueChange={field.onChange} />}
        />
      </div>
      {values?.showLyrics && (
        <div className="flex items-center justify-between">
          <div className="text-medium mr-6">歌词字体颜色</div>
          <Controller
            control={control}
            name="lyricsColor"
            render={({ field }) => {
              const v = field.value;
              const pickerValue = /^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/.test(v || "") ? v : "#ffffff";
              return (
                <ColorPicker
                  value={pickerValue}
                  onChange={hex => field.onChange(hex)}
                  isOpen={lyricsPickerOpen && isUiVisible}
                  onOpenChange={setLyricsPickerOpen}
                >
                  <div
                    className="border-default h-8 w-12 rounded-full border"
                    style={{ backgroundColor: field.value || undefined }}
                  />
                </ColorPicker>
              );
            }}
          />
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="text-medium mr-6">显示频谱图</div>
        <Controller
          control={control}
          name="showSpectrum"
          render={({ field }) => <Switch isSelected={field.value} onValueChange={field.onChange} />}
        />
      </div>
      {values?.showSpectrum && (
        <div className="flex items-center justify-between">
          <div className="text-medium mr-6">频谱图颜色</div>
          <Controller
            control={control}
            name="spectrumColor"
            render={({ field }) => {
              const v = field.value;
              const pickerValue = /^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/.test(v || "") ? v : "#ffffff";
              return (
                <ColorPicker
                  value={pickerValue}
                  onChange={hex => field.onChange(hex)}
                  isOpen={spectrumPickerOpen && isUiVisible}
                  onOpenChange={setSpectrumPickerOpen}
                >
                  <div
                    className="border-default h-8 w-12 rounded-full border"
                    style={{ backgroundColor: v && /^#/.test(v) ? v : undefined }}
                  />
                </ColorPicker>
              );
            }}
          />
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="text-medium mr-6">显示封面</div>
        <Controller
          control={control}
          name="showCover"
          render={({ field }) => <Switch isSelected={field.value} onValueChange={field.onChange} />}
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="text-medium mr-6">显示虚化背景</div>
        <Controller
          control={control}
          name="showBlurredBackground"
          render={({ field }) => <Switch isSelected={field.value} onValueChange={field.onChange} />}
        />
      </div>
      {!values?.showBlurredBackground && (
        <div className="flex items-center justify-between">
          <div className="text-medium mr-6">背景颜色</div>
          <Controller
            control={control}
            name="backgroundColor"
            render={({ field }) => {
              const v = field.value;
              const pickerValue = /^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/.test(v || "")
                ? v
                : (values as any).bgThemeMode === "light"
                  ? "#ffffff"
                  : "#000000";
              return (
                <ColorPicker
                  value={pickerValue}
                  onChange={hex => field.onChange(hex)}
                  isOpen={backgroundPickerOpen && isUiVisible}
                  onOpenChange={setBackgroundPickerOpen}
                >
                  <div
                    className="border-default h-8 w-12 rounded-full border"
                    style={{ backgroundColor: pickerValue }}
                  />
                </ColorPicker>
              );
            }}
          />
        </div>
      )}
    </div>
  );
};

export default FullScreenPlayerSettingsPanel;
