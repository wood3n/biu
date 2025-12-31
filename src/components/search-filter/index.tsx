import React from "react";

import { Input, Select, SelectItem } from "@heroui/react";
import { RiCloseLine, RiSearch2Line, RiSearchLine } from "@remixicon/react";

import IconButton from "@/components/icon-button";

interface SearchFilterProps {
  /** 搜索关键词 */
  keyword?: string;
  /** 排序方式 */
  order?: string;
  /** 搜索框占位符 */
  placeholder?: string;
  /** 排序选项配置 */
  orderOptions: Array<{
    value: string;
    label: string;
  }>;
  /** 搜索图标类型，默认搜索图标 */
  searchIcon?: "search" | "search2";
  /** 搜索关键词变化回调 */
  onKeywordChange?: (keyword: string) => void;
  /** 排序方式变化回调 */
  onOrderChange?: (order: string) => void;
  /** 是否显示清除按钮 */
  showClearButton?: boolean;
  /** 搜索框CSS类名 */
  inputClassName?: string;
  /** 容器CSS类名 */
  containerClassName?: string;
  /** 搜索框最大宽度 (单位：rem) */
  inputMaxWidth?: number;
  /** 排序选择器中等屏幕最小宽度 (单位：rem) */
  selectMinWidth?: number;
  /** 排序选择器中等屏幕宽度 (单位：rem) */
  selectWidth?: number;
}

/**
 * 通用搜索筛选组件
 * 用于实现搜索框和排序选择器的组合功能
 */
const SearchFilter: React.FC<SearchFilterProps> = ({
  keyword = "",
  order = "",
  placeholder = "搜索...",
  orderOptions,
  searchIcon = "search",
  onKeywordChange,
  onOrderChange,
  showClearButton = true,
  inputClassName = "",
  containerClassName = "mb-4 flex flex-wrap items-center gap-4",
  inputMaxWidth = 10, // 默认搜索框最大宽度
  selectMinWidth = 8, // 默认排序选择器最小宽度
  selectWidth = 8, // 默认排序选择器宽度
}) => {
  const handleKeywordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onKeywordChange?.(e.target.value);
  };

  const handleClearKeyword = () => {
    onKeywordChange?.("");
  };

  const renderSearchIcon = () => {
    if (searchIcon === "search2") {
      return <RiSearch2Line size={20} />;
    }
    return <RiSearchLine size={16} />;
  };

  return (
    <div className={containerClassName}>
      {/* 搜索框 */}
      <div className="relative flex-shrink-0">
        <Input
          placeholder={placeholder}
          value={keyword}
          onChange={handleKeywordChange}
          startContent={renderSearchIcon()}
          endContent={
            showClearButton &&
            keyword && (
              <IconButton ariaLabel="清除搜索" onClick={handleClearKeyword}>
                <RiCloseLine size={16} />
              </IconButton>
            )
          }
          className={`${inputClassName} max-w-full`}
          style={{ width: `${inputMaxWidth}rem` }}
        />
      </div>

      {/* 排序方式 */}
      {orderOptions.length > 0 && (
        <div className="flex items-center gap-2">
          <Select
            selectedKeys={[order]}
            onSelectionChange={keys => {
              const selectedValue = Array.from(keys)[0];
              onOrderChange?.(selectedValue as string);
            }}
            className="w-full"
            style={{ minWidth: `${selectMinWidth}rem`, width: `${selectWidth}rem` }}
            placeholder="选择排序方式"
          >
            {orderOptions.map(option => (
              <SelectItem key={option.value}>{option.label}</SelectItem>
            ))}
          </Select>
        </div>
      )}
    </div>
  );
};

export default SearchFilter;
