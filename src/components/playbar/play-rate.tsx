import React from "react";

import { Button, Listbox, ListboxItem, Tooltip } from "@heroui/react";

interface Props {
  value: number;
  onChange: (rate: number) => void;
}

const PlayRate: React.FC<Props> = ({ value, onChange }) => {
  return (
    <>
      <Tooltip
        content={
          <Listbox
            items={[0.5, 1, 1.5, 2].map(v => ({
              label: `${v}x`,
              value: String(v),
            }))}
            disallowEmptySelection
            aria-label="播放速率"
            selectedKeys={new Set([value])}
            selectionMode="single"
            variant="flat"
            onSelectionChange={keys => onChange(Number(Array.from(keys)[0]))}
          >
            {item => <ListboxItem key={item.value}>{item.label}</ListboxItem>}
          </Listbox>
        }
      >
        <Button variant="light" size="sm">
          {`${value}x`}
        </Button>
      </Tooltip>
    </>
  );
};

export default PlayRate;
