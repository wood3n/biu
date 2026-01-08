import clx from "classnames";

import MenuItem, { type MenuItemProps } from "../../components/menu/menu-item";

interface Props {
  title?: React.ReactNode;
  titleExtra?: React.ReactNode;
  items: MenuItemProps[];
  collapsed?: boolean;
  className?: string;
  renderItem?: (item: MenuItemProps, index: number) => React.ReactNode;
}

const MenuGroup = ({ title, titleExtra, items, collapsed, className, renderItem }: Props) => {
  return (
    <>
      {!collapsed && Boolean(title) && (
        <div className="flex items-center justify-between p-2 text-sm text-zinc-500">
          <span>{title}</span>
          {titleExtra}
        </div>
      )}
      <div
        className={clx(
          "flex flex-col items-stretch",
          {
            "px-2": collapsed,
          },
          className,
        )}
      >
        {items.map((item, index) =>
          renderItem ? (
            renderItem(item, index)
          ) : (
            <MenuItem key={(item.id ?? item.href ?? item.title) as React.Key} {...item} collapsed={collapsed} />
          ),
        )}
      </div>
    </>
  );
};

export default MenuGroup;
