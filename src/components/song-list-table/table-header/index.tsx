import {
  MdAccessTime,
} from 'react-icons/md';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@components/table-cell';

const TableHeader = () => (
  <TableHead>
    <TableRow>
      <TableCell style={{ width: 60 }} align="center">
        #
      </TableCell>
      <TableCell>
        歌曲
      </TableCell>
      <TableCell>
        专辑
      </TableCell>
      <TableCell style={{ maxWidth: 80 }} align="center">
        <MdAccessTime size={18} />
      </TableCell>
      <TableCell style={{ width: 60 }} align="center" />
    </TableRow>
  </TableHead>
);

export default TableHeader;
