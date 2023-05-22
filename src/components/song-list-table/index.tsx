import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TooltipButton from '@/components/tooltip-button';
import {
  MdPlayCircle,
  MdSkipNext,
  MdQueueMusic,
  MdShuffle,
  MdAdd,
  MdDownloadForOffline,
  MdOutlineSearch,
  MdFileDownload,
  MdShare,
  MdOutlinePlaylistAddCircle,
  MdAccessTime,
  MdOutlineFavoriteBorder,
  MdOutlineFavorite,
} from 'react-icons/md';
import { useLikelist } from '@/store/likelistAtom';
import { formatDuration } from '@/common/utils';
import { styled } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import SongDescription from '@components/song-description';
import OverflowText from '@components/overflow-text';
import StyledTableRow from './table-row';
import './index.less';

interface Props {
  data: Song[];
}

const SongList: React.FC<Props> = ({
  data,
}) => {
  const { likelist, refresh } = useLikelist();
  const navigate = useNavigate();

  return (
    <TableContainer>
      <Table>
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
        <TableBody>
          {data?.map((rowData, index) => (
            <StyledTableRow key={rowData.id} index={index} data={rowData} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default SongList;
