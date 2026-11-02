import { useEffect, useRef } from "react";

import { getFrameIntervalMs } from "@/common/audio/frame-rate";
import { getSharedAnalyser, resumeSharedAnalyser } from "@/common/audio/shared-analyser";
import { audio as audioElement } from "@/store/play-list";

interface AudioWaveformProps {
  width?: number;
  height?: number;
  barCount?: number;
  barColor?: string;
}

/**
 * 音频波形可视化组件
 * 使用 Web Audio API 实现动态频谱效果
 * 共享 AnalyserNode（与跑马灯节拍检测共用同一实例）
 */
const AudioWaveform = ({ width = 56, height = 56, barCount = 40, barColor = "currentColor" }: AudioWaveformProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationIdRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // shadowBlur 辉光会被 canvas 位图边界裁切，
    // 在四周留 pad 像素让发光完整渲染，再用 CSS 负 margin 恢复原位
    const shadowPad = 10;
    const bitmapW = width + shadowPad * 2;
    const bitmapH = height + shadowPad * 2;
    canvas.width = bitmapW;
    canvas.height = bitmapH;

    // 使用共享 AnalyserNode（与跑马灯节拍检测共用同一实例）
    const initAudio = () => {
      const shared = getSharedAnalyser();
      if (shared) {
        resumeSharedAnalyser();
      }
    };

    // Initialize on mount
    initAudio();

    // Ensure context resumes on play
    const handlePlay = () => {
      resumeSharedAnalyser();
      if (!animationIdRef.current) {
        render();
      }
    };

    const handlePause = () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
        animationIdRef.current = 0;
      }
    };

    // shadowBlur 是按 fill 生效的：逐根柱子设阴影等于每帧跑几百遍离屏高斯。
    // 柱体合并成一条 path、顶部亮点合并成另一条，一整帧只做两次带阴影的 fill
    // 背景压暗了一档，火焰渐变整体提亮约 10% 亮度（色相不动），柱体才不会被背景吃掉
    const fireGradient = ctx.createLinearGradient(0, height, 0, 0);
    fireGradient.addColorStop(0, "#ff6a33");
    fireGradient.addColorStop(0.3, "#ffab55");
    fireGradient.addColorStop(0.6, "#ffe45c");
    fireGradient.addColorStop(1, "#fffbe8");
    const useCustomColor = barColor !== "currentColor";

    let freqData: Uint8Array<ArrayBuffer> | null = null;

    const draw = () => {
      const shared = getSharedAnalyser();
      const analyserNode = shared?.analyser;
      if (!analyserNode) return;

      const bufferLength = analyserNode.frequencyBinCount;
      if (!freqData || freqData.length !== bufferLength) {
        freqData = new Uint8Array(bufferLength);
      }
      analyserNode.getByteFrequencyData(freqData);

      ctx.clearRect(0, 0, bitmapW, bitmapH);

      const computedBarWidth = width / barCount;
      const barGap = computedBarWidth * 0.5;
      const barWidth = computedBarWidth - barGap;

      const usefulBufferLength = Math.floor(bufferLength * 0.6);

      const bars = new Path2D();
      const tips = new Path2D();
      let hasTip = false;

      for (let i = 0; i < barCount; i++) {
        const dataIndex = Math.floor((i / barCount) * usefulBufferLength);
        let value = freqData[dataIndex];

        const boost = 1 + i / barCount;
        value = Math.min(255, value * boost);

        const barHeight = Math.max((value / 255) * height, 2);

        const x = i * computedBarWidth + shadowPad;
        const y = height - barHeight + shadowPad;

        bars.roundRect(x, y, barWidth, barHeight, 2);

        if (!useCustomColor && barHeight > 6) {
          tips.roundRect(x, y, barWidth, 3, 1.5);
          hasTip = true;
        }
      }

      ctx.shadowColor = useCustomColor ? barColor : "#ff8c42";
      ctx.shadowBlur = 8;
      ctx.fillStyle = useCustomColor ? barColor : fireGradient;
      ctx.fill(bars);

      if (hasTip) {
        ctx.shadowBlur = 4;
        ctx.fillStyle = "rgba(255, 252, 232, 0.85)";
        ctx.fill(tips);
      }
      ctx.shadowBlur = 0;
    };

    let lastDrawAt = 0;

    const render = () => {
      animationIdRef.current = requestAnimationFrame(render);

      const now = performance.now();
      if (now - lastDrawAt < getFrameIntervalMs()) return;
      lastDrawAt = now;

      draw();
    };

    audioElement.addEventListener("play", handlePlay);
    audioElement.addEventListener("pause", handlePause);

    // Initialize state
    if (!audioElement.paused) {
      render();
    } else {
      draw();
    }

    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      audioElement.removeEventListener("play", handlePlay);
      audioElement.removeEventListener("pause", handlePause);
    };
  }, [width, height, barCount, barColor]);

  // 位图比可视区大 shadowPad*2，用 CSS 负 margin 把发光空间"悬出"到 canvas 外
  const shadowPad = 10;
  return (
    <canvas
      ref={canvasRef}
      style={{
        width: width + shadowPad * 2,
        height: height + shadowPad * 2,
        margin: -shadowPad,
      }}
    />
  );
};

export default AudioWaveform;
