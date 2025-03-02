import React from "react";

import { Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Link } from "@heroui/react";
import { RiMoreLine } from "@remixicon/react";

interface Props {
  ars: Ar[];
}

/**
 * 艺人串
 */
const Artists: React.FC<Props> = ({ ars }) => {
  return (
    <div className="flex items-center">
      {ars?.slice(0, 3)?.map<React.ReactNode>(({ id, name }, i) => (
        <React.Fragment key={id}>
          {i ? <span className="text-sm text-zinc-500">，</span> : ""}
          <Link className="inline-block min-w-0 flex-shrink truncate text-sm text-zinc-500" underline="hover" color="foreground" href={`/artist/${id}`}>
            {name}
          </Link>
        </React.Fragment>
      ))}
      {ars?.length > 3 && (
        <Dropdown>
          <DropdownTrigger>
            <span className="ml-1 text-zinc-700">
              <RiMoreLine size={14} />
            </span>
          </DropdownTrigger>
          <DropdownMenu items={ars} aria-label="其他艺人" variant="flat">
            {item => <DropdownItem key={item.id}>{item.name}</DropdownItem>}
          </DropdownMenu>
        </Dropdown>
      )}
    </div>
  );
};

export default Artists;
