import Chip from '@mui/material/Chip';
import { styled } from '@mui/material/styles';

const StyledChip = styled(Chip)(({ theme }) => ({
  '&.MuiChip-filled:hover': {
    backgroundColor: theme.palette.primary.main,
  },
}));

export default StyledChip;
