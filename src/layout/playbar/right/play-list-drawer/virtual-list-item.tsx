import { type ReactNode } from "react";

interface Props {
  children: ReactNode;
  virtualOffset: number;
}

const VirtualListItem = ({ children, virtualOffset }: Props) => {
  return (
    <div
      style={{
        transform: `translate3d(0, ${virtualOffset}px, 0)`,
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        transformOrigin: "0 0",
        willChange: "transform",
      }}
    >
      {children}
    </div>
  );
};

export default VirtualListItem;
