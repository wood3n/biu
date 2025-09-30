import MenuItem, { type MenuItemProps } from "./menu-item";

interface Props {
  title: React.ReactNode;
  titleExtra?: React.ReactNode;
  items: MenuItemProps[];
}

const MenuGroup = ({ title, titleExtra, items }: Props) => {
  return (
    <>
      <div className="flex items-center justify-between p-2 text-sm text-zinc-500">
        <span>{title}</span>
        {titleExtra}
      </div>
      <div className="flex flex-col space-y-1">
        {items.map(item => (
          <MenuItem key={item.href} {...item} />
        ))}
      </div>
    </>
  );
};

export default MenuGroup;
