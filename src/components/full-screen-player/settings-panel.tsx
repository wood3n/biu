import { useEffect, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";

import { Switch } from "@heroui/react";
import { useShallow } from "zustand/shallow";

import { isHex } from "@/common/utils/color";
import ColorPicker from "@/components/color-picker";
import { useFullScreenPlayerSettings } from "@/store/full-screen-player-settings";
import { usePlayList } from "@/store/play-list";

const FullScreenPlayerSettingsPanel = ({ isUiVisible = true }: { isUiVisible?: boolean }) => {
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
    showLyricsTranslation,
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
      showLyricsTranslation: s.showLyricsTranslation,
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
      showLyricsTranslation,
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
    if (!isUiVisible) {
      setLyricsPickerOpen(false);
      setSpectrumPickerOpen(false);
      setBackgroundPickerOpen(false);
    }
  }, [isUiVisible]);

  useEffect(() => {
    setValue("showLyrics", showLyrics);
    setValue("showLyricsTranslation", showLyricsTranslation);
    setValue("showSpectrum", showSpectrum);
    setValue("showCover", showCover);
    setValue("showBlurredBackground", showBlurredBackground);
    setValue("backgroundColor", backgroundColor);
    setValue("spectrumColor", spectrumColor);
    setValue("lyricsColor", lyricsColor);
  }, [
    setValue,
    showLyrics,
    showLyricsTranslation,
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
      showLyricsTranslation: values.showLyricsTranslation,
      showSpectrum: values.showSpectrum,
      showCover: values.showCover,
      showBlurredBackground: values.showBlurredBackground,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    values?.showLyrics,
    values?.showLyricsTranslation,
    values?.showSpectrum,
    values?.showCover,
    values?.showBlurredBackground,
    update,
  ]);

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
        <>
          <div className="flex items-center justify-between">
            <div className="text-medium mr-6">显示歌词翻译</div>
            <Controller
              control={control}
              name="showLyricsTranslation"
              render={({ field }) => <Switch isSelected={field.value} onValueChange={field.onChange} />}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="text-medium mr-6">歌词字体颜色</div>
            <Controller
              control={control}
              name="lyricsColor"
              render={({ field }) => {
                const v = field.value;
                const pickerValue = isHex(v) ? v : "#ffffff";
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
        </>
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
              const pickerValue = isHex(v) ? v : "#ffffff";
              return (
                <ColorPicker
                  value={pickerValue}
                  onChange={hex => field.onChange(hex)}
                  isOpen={spectrumPickerOpen && isUiVisible}
                  onOpenChange={setSpectrumPickerOpen}
                >
                  <div
                    className="border-default h-8 w-12 rounded-full border"
                    style={{ backgroundColor: isHex(v) ? v : undefined }}
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
          render={({ field }) => (
            <Switch isSelected={field.value} onValueChange={field.onChange} isDisabled={isLocal} />
          )}
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
              return (
                <ColorPicker
                  value={field.value}
                  onChange={hex => field.onChange(hex)}
                  isOpen={backgroundPickerOpen && isUiVisible}
                  onOpenChange={setBackgroundPickerOpen}
                >
                  <div
                    className="border-default h-8 w-12 rounded-full border"
                    style={{ backgroundColor: field.value }}
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
