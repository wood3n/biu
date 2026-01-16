import React from "react";
import { Controller, type Control } from "react-hook-form";

import { Card, CardBody, CardFooter } from "@heroui/react";

import { Themes } from "@/common/constants/theme";
import ColorPicker from "@/components/color-picker";
import { useTheme } from "@/components/theme/use-theme";

const ColorItem = ({
  label,
  value,
  onChange,
  presets,
}: {
  label: string;
  value?: string;
  onChange: (hex: string) => void;
  presets?: string[];
}) => {
  return (
    <ColorPicker value={value} onChange={onChange} presets={presets}>
      <Card as="div" isPressable radius="md" shadow="sm" className="border-default w-[100px] border">
        <CardBody
          className="border-default h-[40px] items-center border-b p-0"
          style={{ backgroundColor: value || presets?.[0] }}
        />
        <CardFooter className="justify-center p-2 text-xs">
          <b>{label}</b>
        </CardFooter>
      </Card>
    </ColorPicker>
  );
};

const ColorSettings = ({ control }: { control: Control<AppSettings> }) => {
  const { theme } = useTheme();

  return (
    <div className="flex w-full justify-end gap-3">
      <Controller
        control={control}
        name="backgroundColor"
        render={({ field }) => (
          <ColorItem
            label="背景"
            value={field.value ?? Themes[theme].colors.background}
            onChange={v => field.onChange(v)}
            presets={[Themes[theme].colors.background]}
          />
        )}
      />
      <Controller
        control={control}
        name="primaryColor"
        render={({ field }) => (
          <ColorItem
            label="主色"
            value={field.value ?? Themes[theme].colors.primary}
            onChange={v => field.onChange(v)}
            presets={[Themes[theme].colors.primary]}
          />
        )}
      />
    </div>
  );
};

export default ColorSettings;
