import { ContextProp } from "react-virtuoso";

export type ScrollProps = ContextProp<{
  songs?: Song[];
}>;

interface RenderCellProps<T> {
  rowData: T;
  index: number;
  isSelected?: boolean;
}

interface ColumnType<T> {
  title: React.ReactNode;
  key: string;
  align?: "center" | "start" | "end" | undefined;
  hidden?: boolean;
  className?: string;
  headerClassName?: string;
  render: (props: RenderCellProps<T>) => React.ReactNode;
}

export type ColumnsType<T> = ColumnType<T>[];
