import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TooltipButton from '@/components/tooltip-button';
import {
  MdOutlineFavoriteBorder,
  MdOutlineFavorite,
  MdPlayArrow,
  MdOutlineInfo,
} from 'react-icons/md';
import { useLikelist } from '@/store/likelist-atom';
import { formatDuration } from '@/common/utils';
import TableRow from '@mui/material/TableRow';
import { Audio as AudioSpinner } from 'react-loader-spinner';
import SongDescription from '@components/song-description';
import OverflowText from '@components/overflow-text';
import usePlay from '@/common/hooks/usePlay';
import TableCell from '../table-cell';

interface Props {
  index: number;
  data: Song;
}

const StyledTableRow = ({
  index,
  data,
}: Props) => {
  const navigate = useNavigate();
  const { playingSong, play } = usePlay();
  const [hovered, setHover] = useState(false);
  const { likelist, refresh } = useLikelist();
  // 无版权禁止播放
  const canPlay = !data?.noCopyrightRcmd;

  return (
    <TableRow
      hover
      selected={playingSong?.id === data.id}
      key={data.id}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onDoubleClick={() => { play(data) }}
      sx={{
        cursor: 'pointer',
      }}
    >
      <TableCell
        align="center"
        sx={{
          width: '48px',
          color: (theme) => theme.palette.text.secondary,
          borderTopLeftRadius: (theme) => theme.shape.borderRadius,
          borderBottomLeftRadius: (theme) => theme.shape.borderRadius,
        }}
      >
        {playingSong?.id === data.id
          ? <AudioSpinner width={16} height={16} wrapperStyle={{ justifyContent: 'center' }} />
          : hovered
            ? (
              <TooltipButton
                placement="top"
                size="small"
                title={canPlay ? '播放' : data?.noCopyrightRcmd?.typeDesc ?? '无法播放'}
                onClick={() => { play(data) }}
                PopperProps={{
                  disablePortal: true,
                  style: { pointerEvents: 'none' },
                }}
              >
                {canPlay ? <MdPlayArrow size={18} /> : <MdOutlineInfo size={18} />}
              </TooltipButton>
            )
            : index + 1}
      </TableCell>
      <TableCell>
        <SongDescription
          picUrl={data?.al?.picUrl}
          name={data?.name}
          ar={data?.ar}
          noCopyrightRcmd={data?.noCopyrightRcmd}
        />
      </TableCell>
      <TableCell>
        <OverflowText
          link
          color={(theme) => theme.palette.text.secondary}
          title={data?.al?.name}
          onClick={() => navigate(`/album/${data?.id}`)}
          sx={{ maxWidth: 180 }}
        >
          {data?.al?.name ?? '-'}
        </OverflowText>
      </TableCell>
      <TableCell sx={{ color: (theme) => theme.palette.text.secondary }} align="center">
        {formatDuration(data?.dt)}
      </TableCell>
      <TableCell
        align="center"
        sx={{
          borderTopRightRadius: (theme) => theme.shape.borderRadius,
          borderBottomRightRadius: (theme) => theme.shape.borderRadius,
        }}
      >
        {likelist.includes(data?.id) ? (
          <TooltipButton size="small" title="取消喜欢">
            <MdOutlineFavorite />
          </TooltipButton>
        ) : (
          <TooltipButton size="small" title="喜欢">
            <MdOutlineFavoriteBorder />
          </TooltipButton>
        )}
      </TableCell>
    </TableRow>
  );
};

export default StyledTableRow;
