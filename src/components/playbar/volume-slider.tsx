import Slider, { SliderThumb } from '@mui/material/Slider';
import { styled } from '@mui/material/styles';

interface ComponentProps extends React.HTMLAttributes<unknown> {}

export function VolumeSliderThumb(props: ComponentProps) {
  const { children, ...other } = props;
  return (
    <SliderThumb {...other}>
      {children}
      <span className="airbnb-bar" />
      <span className="airbnb-bar" />
      <span className="airbnb-bar" />
    </SliderThumb>
  );
}

const VolumeSlider = styled(Slider)(() => ({
  height: 3,
  padding: '13px 0',
  '& .MuiSlider-thumb': {
    height: 16,
    width: 16,
    backgroundColor: '#fff',
    border: '1px solid currentColor',
  },
}));

export default VolumeSlider;
