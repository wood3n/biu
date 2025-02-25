import { Input, Link, Navbar, NavbarContent, NavbarItem } from "@heroui/react";
import { RiSearchLine } from "@remixicon/react";

import UserChip from "../user";

const LayoutNavbar = () => {
  return (
    <Navbar isBordered className="window-drag h-16 w-full">
      <NavbarContent justify="start" className="window-no-drag">
        <NavbarContent className="hidden gap-3 sm:flex">
          <NavbarItem>
            <Link color="foreground" href="#">
              Features
            </Link>
          </NavbarItem>
          <NavbarItem isActive>
            <Link aria-current="page" color="secondary" href="#">
              Customers
            </Link>
          </NavbarItem>
          <NavbarItem>
            <Link color="foreground" href="#">
              Integrations
            </Link>
          </NavbarItem>
        </NavbarContent>
      </NavbarContent>

      <NavbarContent as="div" className="window-no-drag items-center" justify="end">
        <Input
          classNames={{
            base: "max-w-full sm:max-w-[10rem] h-10",
            mainWrapper: "h-full",
            input: "text-small",
            inputWrapper: "h-full font-normal text-default-500 bg-default-400/20 dark:bg-default-500/20",
          }}
          placeholder="搜索"
          size="sm"
          startContent={<RiSearchLine size={18} />}
          type="search"
        />
        <UserChip />
      </NavbarContent>
    </Navbar>
  );
};

export default LayoutNavbar;
