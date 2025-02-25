import React from "react";

import { Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Link } from "@heroui/react";
import { RiMoreLine } from "@remixicon/react";

interface Props {
  ars: Ar[];
  className?: string;
}

/**
 * 艺人串
 */
const Artists: React.FC<Props> = ({ ars, className }) => {
  return (
    <div className="flex items-center">
      {ars?.slice(0, 3)?.map<React.ReactNode>(({ id, name }, i) => (
        <React.Fragment key={id}>
          {i ? <span className={className}>,&nbsp;</span> : ""}
          <Link className={className} underline="hover" color="foreground" href={`/artist/${id}`}>
            {name}
          </Link>
        </React.Fragment>
      ))}
      {ars?.length > 3 && (
        <Dropdown>
          <DropdownTrigger>
            <RiMoreLine size={14} />
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
