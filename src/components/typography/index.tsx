import { tauriAdapter } from "@/utils/tauri-adapter";

import ScrollContainer from "../scroll-container";

interface Props {
  content: string;
}

const Typography = ({ content }: Props) => {
  const handleLinkClick: React.MouseEventHandler<HTMLDivElement> = e => {
    const target = (e.target as Element)?.closest("a");

    if (target && target.href) {
      e.preventDefault(); // 阻止默认行为（防止在当前窗口跳转）
      tauriAdapter.openExternal(target.href); // 调用系统浏览器打开
    }
  };

  return (
    <ScrollContainer>
      <div
        className="prose dark:prose-invert px-6"
        onClick={handleLinkClick}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </ScrollContainer>
  );
};

export default Typography;
