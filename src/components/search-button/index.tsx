import React, { useRef, useState, useEffect } from "react";

import { Button, Input } from "@heroui/react";
import { RiSearchLine } from "@remixicon/react";
import { useClickAway, useDebounceFn } from "ahooks";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  onSearch?: (value: string) => void;
}

export const SearchButton = ({ onSearch }: Props) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [value, setValue] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { run: handleSearch } = useDebounceFn(
    (val: string) => {
      onSearch?.(val);
    },
    { wait: 500 },
  );

  useClickAway(() => {
    if (isExpanded) {
      setIsExpanded(false);
    }
  }, containerRef);

  useEffect(() => {
    if (isExpanded && inputRef.current) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [isExpanded]);

  return (
    <div ref={containerRef} className="flex items-center justify-end">
      <AnimatePresence mode="popLayout" initial={false}>
        {!isExpanded ? (
          <motion.div
            key="button"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            layout
          >
            <Button isIconOnly radius="md" variant="flat" onPress={() => setIsExpanded(true)} aria-label="搜索">
              <RiSearchLine size={18} />
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="input"
            initial={{ width: 40, opacity: 0 }}
            animate={{ width: 240, opacity: 1 }}
            exit={{ width: 40, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            layout
            className="flex items-center"
          >
            <Input
              isClearable
              radius="md"
              value={value}
              onValueChange={val => {
                setValue(val);
                handleSearch(val);
              }}
              onClear={() => {
                handleSearch("");
              }}
              onKeyDown={e => {
                if (e.key === "Enter" && value?.trim()) {
                  handleSearch(value);
                }
              }}
              ref={inputRef}
              placeholder="搜索"
              startContent={<RiSearchLine size={18} className="text-default-400" />}
              classNames={{
                inputWrapper: "h-10 pr-1",
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchButton;
