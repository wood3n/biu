interface RenderCellProps<T> {
  value: any;
  rowData: T;
  index: number;
  isSelected: boolean;
  isHovered?: boolean;
}

interface ColumnType<T> {
  title: React.ReactNode;
  key: string;
  columnFraction?: number;
  minWidth?: number | string;
  align?: "center" | "start" | "end" | undefined;
  className?: string;
  render?: (props: RenderCellProps<T>) => React.ReactNode;
}

export type ColumnsType<T> = ColumnType<T>[];
