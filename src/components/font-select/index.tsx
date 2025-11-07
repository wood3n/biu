import React, { useEffect, useState } from "react";

import { Select, SelectItem } from "@heroui/react";

import { defaultAppSettings } from "@shared/settings/app-settings";

export interface FontSelectProps {
  color?: "primary" | "secondary";
  value?: string;
  onChange: (value: string) => void;
  className?: string;
}

export default function FontSelect({
  color,
  value = defaultAppSettings.fontFamily,
  onChange,
  className,
}: FontSelectProps) {
  const [fonts, setFonts] = useState<Partial<IFontInfo>[]>([]);

  const getFonts = async () => {
    const fonts = await window.electron.getFonts();
    setFonts([{ name: "系统默认", familyName: defaultAppSettings.fontFamily }, ...fonts]);
  };

  useEffect(() => {
    getFonts();
  }, []);

  return (
    <Select
      color={color}
      aria-label="选择字体"
      placeholder="选择字体"
      selectedKeys={new Set([value])}
      onChange={e => onChange?.(e.target.value)}
      items={fonts}
      className={className}
    >
      {font => (
        <SelectItem key={font.familyName} style={{ fontFamily: font.familyName }}>
          {font.name}
        </SelectItem>
      )}
    </Select>
  );
}
