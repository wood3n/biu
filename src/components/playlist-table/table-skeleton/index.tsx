import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import TableCell from '../table-cell';

const TableSkeleton = () => (
  <TableBody>
    {Array(12).fill(0).map((_, i) => (
      <TableRow key={String(i)}>
        <TableCell align="center" sx={{ width: '48px' }}>
          <Skeleton animation={false} variant="circular" width={18} height={18} sx={{ transform: 'translateX(6px)' }} />
        </TableCell>
        <TableCell>
          <Stack spacing={1} direction="row">
            <Skeleton animation="wave" variant="rectangular" width={50} height={50} />
            <Stack sx={{ flex: 1 }} spacing={1}>
              <Skeleton
                animation="wave"
                height={24}
                width="80%"
              />
              <Skeleton
                animation="wave"
                height={14}
                width="60%"
              />
            </Stack>
          </Stack>
        </TableCell>
        <TableCell>
          <Skeleton
            animation="wave"
            height={10}
          />
        </TableCell>
        <TableCell align="center">
          <Skeleton
            animation="wave"
            height={10}
          />
        </TableCell>
        <TableCell align="center" sx={{ width: '48px' }}>
          <Skeleton
            animation="wave"
            variant="circular"
            height={24}
            width={24}
          />
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
);

export default TableSkeleton;
