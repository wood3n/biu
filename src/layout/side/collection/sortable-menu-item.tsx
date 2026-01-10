import { useMemo, type CSSProperties } from "react";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import ContextMenu, { type ContextMenuItem } from "@/components/context-menu";
import MenuItem, { type MenuItemProps } from "@/components/menu/menu-item";

interface Props extends MenuItemProps {
  id: number | string;
  disabled?: boolean;
  contextMenuItems?: ContextMenuItem[];
  onContextMenuAction?: (key: string) => void;
}

const SortableMenuItem = ({ id, disabled, contextMenuItems, onContextMenuAction, ...itemProps }: Props) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
    disabled,
  });

  const dragProps = useMemo(() => {
    if (disabled) {
      return {};
    }

    return {
      ...attributes,
      ...listeners,
    };
  }, [attributes, listeners, disabled]);

  const style = useMemo(() => {
    return {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.7 : 1,
      cursor: disabled ? undefined : "grab",
      touchAction: disabled ? undefined : "none",
      display: "flex",
      alignItems: "center",
    } as CSSProperties;
  }, [transform, transition, isDragging, disabled]);

  const itemContent = <MenuItem {...itemProps} dndProps={dragProps} />;

  return (
    <div ref={setNodeRef} style={style}>
      {contextMenuItems?.length ? (
        <ContextMenu
          className="flex h-full w-full items-center"
          items={contextMenuItems}
          onAction={onContextMenuAction}
        >
          {itemContent}
        </ContextMenu>
      ) : (
        itemContent
      )}
    </div>
  );
};

export default SortableMenuItem;
