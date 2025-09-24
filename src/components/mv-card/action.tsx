import { Dropdown, DropdownTrigger, Button, DropdownMenu, DropdownItem } from "@heroui/react";
import { RiMore2Line } from "@remixicon/react";

export interface ActionItem {
  key: string;
  icon: React.ReactNode;
  label: string;
  onPress: VoidFunction;
}

interface Props {
  items?: ActionItem[];
}

const Action = ({ items }: Props) => {
  return (
    <div className="pointer-events-none absolute top-2 right-0">
      <Dropdown disableAnimation placement="bottom-start">
        <DropdownTrigger>
          <Button
            as="span"
            isIconOnly
            size="sm"
            variant="light"
            radius="full"
            className="pointer-events-auto"
            onPointerDown={e => {
              e.stopPropagation();
              e.preventDefault();
            }}
            onPointerUp={e => {
              e.stopPropagation();
              e.preventDefault();
            }}
          >
            <RiMore2Line size={16} style={{ strokeWidth: 2 }} />
          </Button>
        </DropdownTrigger>
        <DropdownMenu aria-label="视频操作菜单" items={items}>
          {item => (
            <DropdownItem
              key={item.key}
              startContent={item.icon}
              onPress={item.onPress}
              onKeyDown={e => e.stopPropagation()}
            >
              {item.label}
            </DropdownItem>
          )}
        </DropdownMenu>
      </Dropdown>
    </div>
  );
};

export default Action;
