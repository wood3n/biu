import { useEffect, useRef, useState } from "react";

import { twMerge } from "tailwind-merge";

interface Props {
  children: React.ReactNode;
  className?: string;
  /** 滚动速度：动画持续时间（秒），值越小越快，默认 8 */
  speed?: number;
  /** 是否始终滚动（正在播放时），为 false 时仅 hover 才滚动 */
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
 * 2. 溢出检测用临时 probe 元素测量单份文字宽度，不依赖 span 自身的 scrollWidth（避免双份内容导致测量跳变）
 * 3. ResizeObserver 只监听容器 div（宽度变化时重新判断溢出）
 * 4. span 的 display 状态恒定，不因滚动切换而改变布局（防止 ResizeObserver 循环触发 → 抖动）
 * 5. 不滚动时容器用 text-overflow: ellipsis 显示省略号
 */
const MarqueeText = ({ children, className, speed = 8, active = false, title, onClick }: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isOverflow, setIsOverflow] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [containerWidth, setContainerWidth] = useState(0);

  const shouldScroll = isOverflow && (active || isHovered);

  // 检测溢出：probe 元素测量文字真实宽度，ResizeObserver 只监听容器
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const measure = () => {
      const cw = container.clientWidth;
      setContainerWidth(cw);

      // 用 probe 元素测量文字宽度，不依赖 span 自身（避免布局干扰）
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

  // 滚动时通过 CSS variable 告诉 keyframes 容器宽度（控制 translateX 终点）
  const animationDuration = speed;
  const isScrolling = shouldScroll && containerWidth > 0;

  return (
    <div
      ref={containerRef}
      className={twMerge(
        "min-w-0 flex-1 overflow-hidden whitespace-nowrap",
        !isScrolling && "text-ellipsis",
        className,
      )}
      style={
        {
          "--marquee-vw": `${containerWidth}px`,
        } as React.CSSProperties
      }
      title={title}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span
        className="inline-block whitespace-nowrap will-change-transform"
        style={
          isScrolling
            ? {
                animation: `marquee-scroll ${animationDuration}s linear infinite`,
                animationPlayState: "running",
              }
            : undefined
        }
      >
        {children}
      </span>
    </div>
  );
};

export default MarqueeText;
