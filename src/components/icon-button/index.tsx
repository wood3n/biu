import React from "react";

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLDivElement> {
  /** 按钮内容，通常是图标 */
  children: React.ReactNode;
  /** 无障碍标签 */
  ariaLabel: string;
  /** 自定义类名 */
  className?: string;
}

/**
 * 可重用的图标按钮组件，包含一致的样式和无障碍功能
 */
const IconButton: React.FC<IconButtonProps> = ({
  children,
  ariaLabel,
  className = "",
  onClick,
  onKeyDown,
  ...props
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick?.(e as unknown as React.MouseEvent<HTMLDivElement>);
    }
    onKeyDown?.(e);
  };

  return (
    <div
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={ariaLabel}
      className={`bg-content2 hover:bg-content3 flex h-6 w-6 cursor-pointer items-center justify-center rounded-md transition-colors ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default IconButton;
