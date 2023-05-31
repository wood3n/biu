export interface MenuProps {
  label: React.ReactNode;
  icon?: React.ReactNode;
  key: string;
  sub?: MenuProps[];
}
