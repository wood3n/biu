import { styled } from '@mui/material/styles';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';

const StyledTableCell = styled(TableCell)(() => ({
  [`&.${tableCellClasses.head}`]: {
    padding: 8,
    border: 'none',
  },
  [`&.${tableCellClasses.body}`]: {
    border: 'none',
    padding: 8,
  },
}));

export default StyledTableCell;
