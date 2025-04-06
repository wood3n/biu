import React, { useState } from "react";

import { Button, Input } from "@heroui/react";
import { RiSearchLine } from "@remixicon/react";

import { StyleConfig } from "./config";

interface Props {
  onSearch: (value: string) => void;
}

const Search: React.FC<Props> = ({ onSearch }) => {
  const [focused, setFocused] = useState(false);

  if (focused)
    return (
      <Input
        className="w-40 border-none outline-transparent"
        color="success"
        // autoFocus outline color https://github.com/heroui-inc/heroui/issues/2307
        classNames={{
          inputWrapper: ["group-data-[focus-visible=true]:ring-0 group-data-[focus-visible=true]:ring-offset-0"],
        }}
        autoFocus
        onBlur={() => setFocused(false)}
        onChange={e => onSearch(e.target.value)}
        startContent={<RiSearchLine size={StyleConfig.ToolbarIconSize} className="flex-none" />}
      />
    );

  return (
    <Button isIconOnly onPress={() => setFocused(true)}>
      <RiSearchLine size={StyleConfig.ToolbarIconSize} />
    </Button>
  );
};

export default Search;
