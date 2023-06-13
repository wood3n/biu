import {
  MdAccessTime,
} from 'react-icons/md';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '../table-cell';

const TableHeader = () => (
  <TableHead>
    <TableRow>
      <TableCell sx={{ width: '48px', color: (theme) => theme.palette.text.secondary }} align="center">
        #
      </TableCell>
      <TableCell sx={{ color: (theme) => theme.palette.text.secondary }}>
        歌曲
      </TableCell>
      <TableCell sx={{ color: (theme) => theme.palette.text.secondary }}>
        专辑
      </TableCell>
      <TableCell sx={{ color: (theme) => theme.palette.text.secondary }} align="center">
        <MdAccessTime size={18} />
      </TableCell>
      <TableCell sx={{ color: (theme) => theme.palette.text.secondary }} align="center" />
    </TableRow>
  </TableHead>
);

export default TableHeader;
