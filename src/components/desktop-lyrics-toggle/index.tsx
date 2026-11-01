import clx from "classnames";

import IconButton from "@/components/icon-button";
import { useSettings } from "@/store/settings";

/** 播放栏右侧的桌面歌词开关，按钮内容即「词」字 */
const DesktopLyricsToggle = () => {
  const enabled = useSettings(s => s.desktopLyricsEnabled);
  const updateSettings = useSettings(s => s.update);

  return (
    <IconButton
      className={clx("min-w-fit text-[13px] leading-none font-medium", { "text-primary": enabled })}
      aria-label="桌面歌词"
      aria-pressed={enabled}
      tooltip={enabled ? "关闭桌面歌词" : "开启桌面歌词"}
      onPress={() => updateSettings({ desktopLyricsEnabled: !enabled })}
    >
      词
    </IconButton>
  );
};

export default DesktopLyricsToggle;
