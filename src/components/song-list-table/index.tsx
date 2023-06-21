import React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import TableHead from './table-header';
import TableRow from './table-row';
import TableSkeleton from './table-skeleton';

interface Props {
  loading: boolean;
  data: Song[];
}

const SongList: React.FC<Props> = ({
  loading,
  data,
}) => (
  <TableContainer>
    <Table>
      <TableHead />
      {loading ? <TableSkeleton /> : (
        <TableBody>
          {data?.map((rowData, index) => ((
            <TableRow key={rowData.id} index={index} data={rowData} />
          )))}
        </TableBody>
      )}
    </Table>
  </TableContainer>
);

export default SongList;
