import { useMemo, type CSSProperties } from "react";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import MenuItem, { type MenuItemProps } from "@/components/menu/menu-item";

interface Props extends MenuItemProps {
  id: number | string;
  disabled?: boolean;
}

const SortableMenuItem = ({ id, disabled, ...itemProps }: Props) => {
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

  return (
    <div ref={setNodeRef} style={style}>
      <MenuItem {...itemProps} dndProps={dragProps} />
    </div>
  );
};

export default SortableMenuItem;
