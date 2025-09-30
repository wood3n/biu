import React, { useEffect, useState } from "react";

import { Select, SelectItem } from "@heroui/react";

import { DEFAULT_FONT_FAMILY } from "@/common/constants/font";

export interface FontSelectProps {
  color?: "primary" | "secondary";
  value?: string;
  onChange: (value: string) => void;
  className?: string;
}

export default function FontSelect({ color, value = DEFAULT_FONT_FAMILY, onChange, className }: FontSelectProps) {
  const [fonts, setFonts] = useState<Partial<IFontInfo>[]>([]);

  const getFonts = async () => {
    const fonts = await window.electron.getFonts();
    setFonts([{ name: "系统默认", familyName: DEFAULT_FONT_FAMILY }, ...fonts]);
  };

  useEffect(() => {
    getFonts();
  }, []);

  return (
    <Select
      color={color}
      aria-label="选择字体"
      placeholder="选择字体"
      selectedKeys={new Set([value || DEFAULT_FONT_FAMILY])}
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
