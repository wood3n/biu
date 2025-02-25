interface ColumnType<T> {
  title: React.ReactNode;
  key: string;
  align?: "center" | "start" | "end" | undefined;
  colSpan?: number;
  render?: (value: any, rowData: T, index: number) => React.ReactNode;
}

type ColumnsType<T> = ColumnType<T>[];
