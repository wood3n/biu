import { useEffect, useRef, useState } from "react";

import { twMerge } from "tailwind-merge";

interface Props {
  children: React.ReactNode;
  className?: string;
  /** 滚动速度：动画持续时间（秒），值越小越快，默认 8 */
  speed?: number;
  /** 是否始终滚动，为 false 时仅 hover 才滚动 */
  active?: boolean;
  /** HTML title 属性（鼠标悬停 tooltip） */
  title?: string;
  /** 点击事件 */
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

/**
 * 文字溢出时自动滚动（marquee）显示
 *
 * 设计要点：
 * 1. 纯 CSS @keyframes animation 驱动 transform: translateX，GPU 合成层不触发 layout
 * 2. 溢出检测用临时 probe 元素测量单份文字宽度，不依赖 span 自身的 scrollWidth
 * 3. ResizeObserver 只监听容器 div（宽度变化时重新判断溢出）
 * 4. 无缝循环：滚动时轨道渲染双份文字，动画 translateX(-50%) 恰好位移一份文字宽，
 *    第一份滚完时第二份无缝衔接，无空白间隙、无跳变
 * 5. 轨道用 display:flex + width:max-content，规避 inline-block 的 baseline/line-height
 *    额外行框高度（否则容器被撑高，歌名与歌手名上下间距变大）
 * 6. 不滚动时单份文字用 text-overflow: ellipsis 显示省略号
 */
const MarqueeText = ({ children, className, speed = 8, active = false, title, onClick }: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isOverflow, setIsOverflow] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const shouldScroll = isOverflow && (active || isHovered);

  // 检测溢出：probe 元素测量文字真实宽度，ResizeObserver 只监听容器
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const measure = () => {
      const cw = container.clientWidth;

      // 用 probe 元素测量文字宽度，不依赖 span 自身的 scrollWidth（避免布局干扰）
      const probe = document.createElement("span");
      probe.style.cssText = "position:absolute;visibility:hidden;white-space:nowrap;font:inherit";
      probe.textContent = typeof children === "string" ? children : "";
      container.appendChild(probe);
      const textWidth = probe.offsetWidth;
      container.removeChild(probe);

      setIsOverflow(textWidth > cw + 2);
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(container);
    return () => ro.disconnect();
  }, [children]);

  return (
    <div
      ref={containerRef}
      className={twMerge("w-full min-w-0 flex-1 overflow-hidden whitespace-nowrap", className)}
      title={title}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {shouldScroll ? (
        <div
          className="pointer-events-none flex w-max whitespace-nowrap will-change-transform"
          style={{ animation: `marquee-scroll ${speed}s linear infinite` }}
        >
          <span className="flex-none whitespace-nowrap">{children}</span>
          <span aria-hidden="true" className="flex-none whitespace-nowrap">
            {children}
          </span>
        </div>
      ) : (
        <span className="pointer-events-none block max-w-full overflow-hidden text-ellipsis whitespace-nowrap">
          {children}
        </span>
      )}
    </div>
  );
};

export default MarqueeText;
