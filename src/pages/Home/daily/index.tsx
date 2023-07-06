import { useNavigate } from 'react-router-dom';
import TooltipButton from '@/components/tooltip-button';
import {
  MdPlayCircle,
} from 'react-icons/md';
import Box from '@mui/material/Box';
import PlaylistTable from '@/components/playlist-table';
import usePlay from '@/common/hooks/usePlay';

interface Props {
  loading: boolean;
  data?: Song[];
}

/**
 * 每日推荐
 */
const Daily = ({
  loading,
  data,
}: Props) => {
  const { addPlayQueue } = usePlay();

  const timeLength = data?.reduce((acc, { dt }) => acc + (dt ?? 0), 0) ?? 0;

  return (
    <Box sx={{ p: '0 12px 12px 12px' }}>
      <PlaylistTable loading={loading} data={data ?? []} />
    </Box>
  );
};

export default Daily;
