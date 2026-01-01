import React, { useEffect, useState } from "react";

import { Select, SelectItem } from "@heroui/react";

import { defaultAppSettings } from "@shared/settings/app-settings";

export interface FontSelectProps {
  value?: string;
  onChange: (value: string) => void;
  className?: string;
}

export default function FontSelect({ value = defaultAppSettings.fontFamily, onChange, className }: FontSelectProps) {
  const [fonts, setFonts] = useState<Partial<IFontInfo>[]>([]);

  const getFonts = async () => {
    const fonts = await window.electron.getFonts();
    setFonts([{ name: "系统默认", familyName: defaultAppSettings.fontFamily }, ...fonts]);
  };

  useEffect(() => {
    getFonts();
  }, []);

  const selectedValue = value === "system-default" ? "system-ui" : value;

  return (
    <Select
      aria-label="选择字体"
      placeholder="选择字体"
      selectedKeys={new Set([selectedValue])}
      onChange={e => onChange?.(e.target.value)}
      items={fonts}
      className={className}
      listboxProps={{
        color: "primary",
        hideSelectedIcon: true,
      }}
    >
      {font => (
        <SelectItem key={font.familyName} style={{ fontFamily: font.familyName }}>
          {font.name}
        </SelectItem>
      )}
    </Select>
  );
}
