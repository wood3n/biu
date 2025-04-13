import React from "react";
import { useNavigate } from "react-router-dom";

import { uniqBy } from "es-toolkit";
import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Link } from "@heroui/react";
import { RiMoreLine } from "@remixicon/react";

interface Props {
  ars: Ar[];
}

/**
 * 艺人串
 */
const Artists: React.FC<Props> = ({ ars }) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center">
      {uniqBy(ars?.slice(0, 3), item => item.id)?.map<React.ReactNode>(({ id, name }, i) => (
        <React.Fragment key={id}>
          {i ? <span className="text-sm text-zinc-500">,</span> : ""}
          <Link
            className="inline-block min-w-0 flex-shrink truncate text-sm text-zinc-400"
            underline="hover"
            color="foreground"
            href={`/artist/${id}`}
          >
            {name}
          </Link>
        </React.Fragment>
      ))}
      {ars?.length > 3 && (
        <Dropdown>
          <DropdownTrigger>
            <Button
              radius="full"
              variant="light"
              className="ml-1 h-auto min-h-0 min-w-0 p-0.5 text-zinc-400"
              onPointerDown={e => e.stopPropagation()}
            >
              <RiMoreLine size={12} />
            </Button>
          </DropdownTrigger>
          <DropdownMenu items={ars} aria-label="其他艺人" variant="flat">
            {item => (
              <DropdownItem key={item.id} onPress={() => navigate(`/artist/${item.id}`)}>
                {item.name}
              </DropdownItem>
            )}
          </DropdownMenu>
        </Dropdown>
      )}
    </div>
  );
};

export default Artists;
