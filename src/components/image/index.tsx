import { BsMusicNoteBeamed } from 'react-icons/bs';
import { Img } from 'react-image';
import './index.less';
import React from 'react';

interface Props {
  src: string;
  width: number;
  height: number;
  fallback?: JSX.Element | null;
}

const Image = ({
  src,
  width,
  height,
  fallback,
}: Props) => (
  <Img
    alt="name"
    width={50}
    height={50}
    src={src}
    unloader={fallback || <div className="image-error-fallback" style={{ width, height }}><BsMusicNoteBeamed size={24} /></div>}
    loading="lazy"
  />
);

export default Image;
