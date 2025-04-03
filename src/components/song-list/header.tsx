import React from "react";

import { useInViewport } from "ahooks";
import clx from "classnames";
import { motion } from "framer-motion";
import { Input } from "@heroui/react";
import { RiPlayCircleLine, RiSearchLine } from "@remixicon/react";

import AsyncButton from "../async-button";
import If from "../if";
import { ColumnsType } from "./types";

interface Props {
  header?: React.ReactNode;
  stickyNode?: React.ReactNode;
  showToolbar?: boolean;
  columns: ColumnsType<Song>;
  onSearch?: (value: string) => void;
  onPlayAll?: () => void;
}

const Header = ({ header, stickyNode, getScrollElement, showToolbar, columns, onSearch, onPlayAll }: Props) => {
  const toolbarRef = React.useRef<HTMLDivElement>(null);
  const [inViewport] = useInViewport(toolbarRef, {
    root: getScrollElement(),
  });

  return (
    <>
      {header}
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: -20, opacity: !inViewport ? 1 : 0 }}
        transition={{ duration: 0.5 }}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "60px",
          background: "#0070f3",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
        }}
      >
        顶部组件
      </motion.div>
      <If condition={showToolbar}>
        <div ref={toolbarRef} className="mb-4 flex items-center justify-between bg-second-background">
          <div className="flex items-center space-x-4">
            <AsyncButton color="success" startContent={<RiPlayCircleLine size={16} />} onPress={onPlayAll}>
              播放
            </AsyncButton>
          </div>
          <Input
            className="w-60"
            placeholder="搜索歌名"
            onValueChange={onSearch}
            startContent={<RiSearchLine size={16} />}
          />
        </div>
      </If>
      <div className="mb-1 flex space-x-4 rounded-lg bg-zinc-800 py-2 text-sm text-zinc-400">
        {columns.map(({ key, title, align = "start", className }) => (
          <div key={key} className={clx(`flex items-center justify-${align}`, className)}>
            {title}
          </div>
        ))}
      </div>
    </>
  );
};

export default Header;
