import { useState } from 'react';
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
  MdPlayArrow,
} from 'react-icons/md';
import { useAtom } from 'jotai';
import { useLikelist } from '@/store/likelist-atom';
import { playingSongAtom } from '@/store/current-play-atom';
import { formatDuration } from '@/common/utils';
import { styled } from '@mui/material/styles';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import { Audio as AudioSpinner } from 'react-loader-spinner';
import SongDescription from '@components/song-description';
import OverflowText from '@components/overflow-text';

interface Props {
  index: number;
  data: Song;
}

const StyledTableCell = styled(TableCell)(() => ({
  [`&.${tableCellClasses.body}`]: {
    border: 'none',
    padding: 8,
  },
}));

const StyledTableRow = ({
  index,
  data,
}: Props) => {
  const navigate = useNavigate();
  const [hovered, setHover] = useState(false);
  const [playingSong, setPlayingSong] = useAtom(playingSongAtom);
  const { likelist, refresh } = useLikelist();

  return (
    <TableRow
      hover
      selected={playingSong?.id === data.id}
      key={data.id}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onDoubleClick={() => { setPlayingSong(data) }}
      style={{ cursor: 'pointer' }}
    >
      <StyledTableCell style={{ width: 60 }} align="center">
        {playingSong?.id === data.id
          ? <AudioSpinner width={16} height={16} wrapperStyle={{ justifyContent: 'center' }} />
          : hovered
            ? (
              <TooltipButton
                size="small"
                title="播放"
                onClick={() => { setPlayingSong(data) }}
              >
                <MdPlayArrow size={18} />
              </TooltipButton>
            )
            : index + 1}
      </StyledTableCell>
      <StyledTableCell>
        <SongDescription
          picUrl={data?.al?.picUrl}
          name={data?.name}
          ar={data?.ar}
        />
      </StyledTableCell>
      <StyledTableCell>
        <OverflowText
          title={data?.al?.name}
          onClick={() => navigate(`/album/${data?.id}`)}
          className="album"
        >
          {data?.al?.name ?? '-'}
        </OverflowText>
      </StyledTableCell>
      <StyledTableCell style={{ maxWidth: 80 }} align="center">
        {formatDuration(data?.dt)}
      </StyledTableCell>
      <StyledTableCell style={{ width: 60 }} align="center">
        {likelist.includes(data?.id) ? (
          <TooltipButton size="small" title="取消喜欢">
            <MdOutlineFavorite />
          </TooltipButton>
        ) : (
          <TooltipButton size="small" title="喜欢">
            <MdOutlineFavoriteBorder />
          </TooltipButton>
        )}
      </StyledTableCell>
    </TableRow>
  );
};

export default StyledTableRow;
