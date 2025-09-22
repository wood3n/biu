import { Input, InputProps } from "@heroui/react";
import { RiSearchLine } from "@remixicon/react";
import clx from "classnames";

interface Props extends InputProps {
  onSearch: () => void;
}

const SearchInput = ({ onSearch, className, ...props }: Props) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") onSearch();
  };

  return (
    <Input
      {...props}
      onKeyDown={handleKeyDown}
      placeholder="搜索"
      className={clx("window-no-drag", className)}
      endContent={
        <div aria-label="搜索" role="button" tabIndex={0} onKeyDown={handleKeyDown} onClick={() => onSearch()}>
          <RiSearchLine size={16} />
        </div>
      }
    />
  );
};

export default SearchInput;
