import { useEffect, useRef, useState } from "react";

import { twMerge } from "tailwind-merge";

interface Props {
  children: React.ReactNode;
  className?: string;
  /** 滚动速度，px/帧，默认 0.5 */
  speed?: number;
}

/**
 * 文字溢出时自动滚动（marquee）显示
 * 不溢出则静止
 * 溢出时复制一份文字接在后面，形成从左滚出→右侧滚入的循环效果
 */
const MarqueeText = ({ children, className, speed = 0.5 }: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [shouldScroll, setShouldScroll] = useState(false);
  const offsetRef = useRef(0);
  const rafRef = useRef(0);

  useEffect(() => {
    const checkOverflow = () => {
      const container = containerRef.current;
      const text = textRef.current;
      if (!container || !text) return;
      setShouldScroll(text.scrollWidth > container.clientWidth + 2);
    };
    checkOverflow();
    const ro = new ResizeObserver(checkOverflow);
    if (containerRef.current) ro.observe(containerRef.current);
    if (textRef.current) ro.observe(textRef.current);
    return () => ro.disconnect();
  }, [children]);

  useEffect(() => {
    if (!shouldScroll) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      offsetRef.current = 0;
      if (textRef.current) textRef.current.style.transform = "translateX(0)";
      return;
    }

    const text = textRef.current;
    const container = containerRef.current;
    if (!text || !container) return;

    // 测量单份文字宽度：复制后 scrollWidth 包含两份+gap，
    // 用 (scrollWidth - gap) / 2 还原原始文字宽度
    const gap = 24;
    const singleWidth = (text.scrollWidth - gap) / 2;
    const cycle = singleWidth + gap;

    const animate = () => {
      offsetRef.current += speed;
      if (offsetRef.current > cycle) {
        offsetRef.current -= cycle;
      }
      text.style.transform = `translateX(${-offsetRef.current}px)`;
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [shouldScroll, speed]);

  return (
    <div ref={containerRef} className={twMerge("min-w-0 flex-1 overflow-hidden whitespace-nowrap", className)}>
      <span ref={textRef} className="inline-block whitespace-nowrap" style={{ willChange: "transform" }}>
        {shouldScroll ? (
          <>
            {children}
            <span style={{ display: "inline-block", width: 24 }} />
            {children}
          </>
        ) : (
          children
        )}
      </span>
    </div>
  );
};

export default MarqueeText;
