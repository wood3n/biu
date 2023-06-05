import { BsMusicNoteBeamed } from 'react-icons/bs';
import { Img } from 'react-image';
import CircularProgress from '@mui/material/CircularProgress';
import { useTheme } from '@mui/material/styles';
import classNames from 'classnames';
import './index.less';

interface Props {
  src?: string;
  mask?: React.ReactNode;
  showMask?: boolean;
  width?: number | string;
  height?: number| string;
  fallback?: JSX.Element | null;
  style?: React.CSSProperties;
}

const Image = ({
  src,
  mask,
  showMask,
  width,
  height,
  fallback,
  style,
}: Props) => {
  const theme = useTheme();

  return (
    <div
      className={classNames('m-image-container', {
        'm-image-hovered': !showMask,
      })}
      style={{ width, height, borderRadius: theme.shape.borderRadius }}
    >
      <Img
        alt="name"
        width={width}
        height={height}
        src={src || ''}
        loader={<CircularProgress size={12} />}
        unloader={fallback || (
          <div className="image-error-fallback" style={{ width, height, borderRadius: theme.shape.borderRadius }}>
            <BsMusicNoteBeamed size={24} />
          </div>
        )}
        loading="lazy"
        style={{
          borderRadius: theme.shape.borderRadius,
          ...style,
        }}
      />
      {mask && (
        <div
          className={classNames('m-image-mask', {
            'm-image-mask-show': showMask,
          })}
          style={{
            borderRadius: theme.shape.borderRadius,
          }}
        >
          {mask}
        </div>
      )}
    </div>
  );
};

export default Image;
