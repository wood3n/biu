import React, { useEffect, useRef } from 'react';
import * as StackBlur from 'stackblur-canvas';

interface Props {
  backgroundImageUrl: string;
}

const BlurBackground = React.memo(({ backgroundImageUrl }: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current as HTMLCanvasElement;
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

    const backgroundImage = new Image();
    backgroundImage.src = backgroundImageUrl;
    backgroundImage.crossOrigin = 'anonymous';
    backgroundImage.onload = () => {
      ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
      StackBlur.canvasRGBA(canvas, 0, 0, canvas.width, canvas.height, 4);
    };
  }, [backgroundImageUrl]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute', height: '100vh', width: '100vw',
      }}
    />
  );
});

export default BlurBackground;
