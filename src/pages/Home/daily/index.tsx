import { useNavigate } from 'react-router-dom';
import TooltipButton from '@/components/tooltip-button';
import {
  MdPlayCircle,
} from 'react-icons/md';
import Box from '@mui/material/Box';
import SongListTable from '@/components/song-list-table';
import usePlay from '@/common/hooks/usePlay';
import { type DailySong } from '@/service/recommend-songs';

interface Props {
  data?: DailySong[];
}

/**
 * 每日推荐
 */
const Daily = ({
  data,
}: Props) => {
  const { addPlayQueue } = usePlay();

  const timeLength = data?.reduce((acc, { dt }) => acc + (dt ?? 0), 0) ?? 0;

  return (
    <Box sx={{ p: '12px' }}>
      <TooltipButton title="播放" onClick={() => data && addPlayQueue(data, true)}>
        <MdPlayCircle color="#1fdf64" size={48} />
      </TooltipButton>
      <SongListTable data={data ?? []} />
    </Box>
  );
};

export default Daily;
