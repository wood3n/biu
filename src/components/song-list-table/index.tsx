import React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import TableHead from './table-header';
import TableRow from './table-row';

interface Props {
  data: Song[];
}

const SongList: React.FC<Props> = ({
  data,
}) => (
  <TableContainer>
    <Table>
      <TableHead />
      <TableBody>
        {data?.map((rowData, index) => (
          <TableRow key={rowData.id} index={index} data={rowData} />
        ))}
      </TableBody>
    </Table>
  </TableContainer>
);

export default SongList;
