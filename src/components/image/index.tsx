import { BsMusicNoteBeamed } from "react-icons/bs";
import { Img } from "react-image";

import CircularProgress from "@mui/material/CircularProgress";
import { useTheme } from "@mui/material/styles";

import "./index.less";

interface Props {
  src?: string;
  mask?: {
    child: React.ReactNode;
    onClick: React.MouseEventHandler<HTMLDivElement>;
  };
  width?: number;
  height?: number;
  fallback?: JSX.Element | null;
  style?: React.CSSProperties;
  circle?: boolean;
}

function Image({ src = "", mask, width = 48, height = 48, fallback, circle, style }: Props) {
  const theme = useTheme();

  return mask ? (
    <div className="m-image-container" onClick={mask.onClick} style={{ width, height, borderRadius: theme.shape.borderRadius }}>
      <Img
        alt="name"
        width={width}
        height={height}
        src={src}
        loader={
          <div className="image-process-fallback" style={{ width, height, borderRadius: theme.shape.borderRadius }}>
            <CircularProgress size={width * 0.3} />
          </div>
        }
        unloader={
          fallback || (
            <div className="image-process-fallback" style={{ width, height, borderRadius: theme.shape.borderRadius }}>
              <BsMusicNoteBeamed size={width * 0.5} />
            </div>
          )
        }
        loading="lazy"
        style={{
          borderRadius: circle ? "50%" : theme.shape.borderRadius,
          ...style,
        }}
      />
      <div
        className="m-image-mask"
        style={{
          borderRadius: theme.shape.borderRadius,
        }}
      >
        {mask.child}
      </div>
    </div>
  ) : (
    <Img
      alt="name"
      width={width}
      height={height}
      src={src}
      loader={
        <div className="image-process-fallback" style={{ width, height, borderRadius: theme.shape.borderRadius }}>
          <CircularProgress size={width * 0.3} />
        </div>
      }
      unloader={
        fallback || (
          <div className="image-process-fallback" style={{ width, height, borderRadius: theme.shape.borderRadius }}>
            <BsMusicNoteBeamed size={width * 0.5} />
          </div>
        )
      }
      loading="lazy"
      style={{
        borderRadius: circle ? "50%" : theme.shape.borderRadius,
        ...style,
      }}
    />
  );
}

export default Image;
