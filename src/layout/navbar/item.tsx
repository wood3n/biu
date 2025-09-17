import { useEffect, useState } from "react";
import { useLocation } from "react-router";

import { Button, Link } from "@heroui/react";

interface Props {
  icon: React.ReactNode;
  activeIcon: React.ReactNode;
  href: string;
  children: React.ReactNode;
}

const LinkItem = ({ icon, activeIcon, href, children }: Props) => {
  const location = useLocation();
  const [selectedKey, setSelectedKey] = useState<string>("/");

  useEffect(() => {
    const pathname = location.pathname;
    setSelectedKey(pathname || "/");
  }, [location.pathname]);

  const isSelected = selectedKey === href;

  return (
    <Button
      href={href}
      as={Link}
      variant={isSelected ? "flat" : "light"}
      color={isSelected ? "primary" : "default"}
      startContent={isSelected ? activeIcon : icon}
    >
      {children}
    </Button>
  );
};

export default LinkItem;
