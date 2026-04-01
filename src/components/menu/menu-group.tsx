import clx from "classnames";

import MenuItem, { type MenuItemProps } from "../../components/menu/menu-item";

interface Props<T = MenuItemProps> {
  title?: React.ReactNode;
  titleExtra?: React.ReactNode;
  items: Array<T>;
  collapsed?: boolean;
  className?: string;
  renderItem?: (item: T, index: number) => React.ReactNode;
}

const MenuGroup = <T = MenuItemProps,>({ title, titleExtra, items, collapsed, className, renderItem }: Props<T>) => {
  return (
    <div>
      {!collapsed && Boolean(title) && (
        <div className="flex items-center justify-between p-2 text-sm text-zinc-500">
          <span>{title}</span>
          {titleExtra}
        </div>
      )}
      <div
        className={clx(
          "flex flex-col items-stretch gap-1",
          {
            "px-2": collapsed,
          },
          className,
        )}
      >
        {items.map((item, index) => {
          if (renderItem) {
            return renderItem(item as T, index);
          }
          const { id, href, title } = item as MenuItemProps;
          return <MenuItem key={(id as number) ?? href ?? title} {...(item as MenuItemProps)} collapsed={collapsed} />;
        })}
      </div>
    </div>
  );
};

export default MenuGroup;
