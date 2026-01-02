import { twMerge } from "tailwind-merge";

import MenuItem, { type MenuItemProps } from "../../components/menu/menu-item";

interface Props {
  title: React.ReactNode;
  titleExtra?: React.ReactNode;
  itemClassName?: string;
  items: MenuItemProps[];
  collapsed?: boolean;
  className?: string;
}

const MenuGroup = ({ title, titleExtra, itemClassName, items, collapsed, className }: Props) => {
  return (
    <>
      {!collapsed && (
        <div className="flex items-center justify-between p-2 text-sm text-zinc-500">
          <span>{title}</span>
          {titleExtra}
        </div>
      )}
      <div className={twMerge("flex flex-col items-center", className)}>
        {items.map(item => (
          <MenuItem key={item.href} {...item} className={itemClassName} collapsed={collapsed} />
        ))}
      </div>
    </>
  );
};

export default MenuGroup;
