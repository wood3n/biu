import Box from "@mui/material/Box";

import usePlay from "@/common/hooks/usePlay";
import PlaylistTable from "@/components/playlist-table";

interface Props {
  loading: boolean;
  data?: Song[];
}

/**
 * 每日推荐
 */
function Daily({ loading, data }: Props) {
  const { addPlayQueue } = usePlay();

  const timeLength = data?.reduce((acc, { dt }) => acc + (dt ?? 0), 0) ?? 0;

  return (
    <Box sx={{ p: "0 12px 12px 12px" }}>
      <PlaylistTable loading={loading} data={data ?? []} />
    </Box>
  );
}

export default Daily;
