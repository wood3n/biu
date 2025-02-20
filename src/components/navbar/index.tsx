import { Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Input, Link, Navbar, NavbarContent, NavbarItem, User } from "@heroui/react";
import { RiSearchLine } from "@remixicon/react";

import { useUser } from "@/store/user";

const LayoutNavbar = () => {
  const user = useUser(store => store.user);

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
          placeholder="Type to search..."
          size="sm"
          startContent={<RiSearchLine size={18} />}
          type="search"
        />
        <Dropdown placement="bottom-end">
          <DropdownTrigger>
            <User
              avatarProps={{
                src: user?.profile?.avatarUrl,
              }}
              name={user?.profile?.nickname}
            />
          </DropdownTrigger>
          <DropdownMenu aria-label="Profile Actions" variant="flat">
            <DropdownItem key="profile" className="h-14 gap-2">
              <p className="font-semibold">Signed in as</p>
              <p className="font-semibold">zoey@example.com</p>
            </DropdownItem>
            <DropdownItem key="settings">My Settings</DropdownItem>
            <DropdownItem key="team_settings">Team Settings</DropdownItem>
            <DropdownItem key="analytics">Analytics</DropdownItem>
            <DropdownItem key="system">System</DropdownItem>
            <DropdownItem key="configurations">Configurations</DropdownItem>
            <DropdownItem key="help_and_feedback">Help & Feedback</DropdownItem>
            <DropdownItem key="logout" color="danger">
              Log Out
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </NavbarContent>
    </Navbar>
  );
};

export default LayoutNavbar;
