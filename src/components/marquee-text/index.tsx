import { useEffect, useRef, useState } from "react";

import { twMerge } from "tailwind-merge";

interface Props {
  children: React.ReactNode;
  className?: string;
  /** 滚动速度基准：动画持续时间下限（秒），值越小越快，默认 8 */
  speed?: number;
  /** 是否始终滚动，为 false 时仅 hover 才滚动 */
  active?: boolean;
  /** HTML title 属性（鼠标悬停 tooltip） */
  title?: string;
  /** 点击事件 */
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

/** 基准滚动速度（像素/秒），用于按文字宽度动态计算动画时长 */
const PX_PER_SECOND = 40;

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
 * 7. 动画时长按文字宽度动态计算（40px/s 基准），避免长标题滚动过快
 * 8. 内容切换时通过 key 强制重启动画，避免 -50% 距离突变导致视觉跳变
 */
const MarqueeText = ({ children, className, speed = 8, active = false, title, onClick }: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isOverflow, setIsOverflow] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [textWidth, setTextWidth] = useState(0);
  const [scrollKey, setScrollKey] = useState(0);

  const shouldScroll = isOverflow && (active || isHovered);

  // 动态计算动画时长：按基准速度 40px/s 计算，下限为 speed 秒
  const dynamicDuration = Math.max(speed, textWidth > 0 ? textWidth / PX_PER_SECOND : speed);

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
      const tw = probe.offsetWidth;
      container.removeChild(probe);

      setIsOverflow(tw > cw + 2);
      setTextWidth(tw);
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(container);
    return () => ro.disconnect();
  }, [children]);

  // 内容切换时强制重启动画，避免 -50% 距离突变导致视觉跳变
  useEffect(() => {
    setScrollKey(k => k + 1);
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
          key={scrollKey}
          className="pointer-events-none flex w-max whitespace-nowrap will-change-transform"
          style={{ animation: `marquee-scroll ${dynamicDuration}s linear infinite` }}
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
