import { useEffect, useRef } from "react";

interface AudioWaveformProps {
  audioElement: HTMLAudioElement;
  width?: number;
  height?: number;
  barCount?: number;
  barColor?: string;
}

// 全局存储每个音频元素的 source 节点，避免重复创建
const audioSourceMap = new WeakMap<HTMLAudioElement, MediaElementAudioSourceNode>();
const audioContextMap = new WeakMap<HTMLAudioElement, AudioContext>();

/**
 * 音频波形可视化组件
 * 使用 Web Audio API 的 AnalyserNode 来实时显示音频波形
 */
const AudioWaveform = ({
  audioElement,
  width = 56,
  height = 56,
  barCount = 40,
  barColor = "currentColor",
}: AudioWaveformProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    if (!audioElement || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const wasPlaying = !audioElement.paused;
    const currentTime = audioElement.currentTime;
    const volume = audioElement.volume;

    // 使用 WeakMap 存储，避免重复创建（一个音频元素只能有一个 source）
    let audioContext = audioContextMap.get(audioElement);
    let source = audioSourceMap.get(audioElement);

    try {
      if (!audioContext) {
        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioContextMap.set(audioElement, audioContext);
      }

      if (!source) {
        source = audioContext.createMediaElementSource(audioElement);
        audioSourceMap.set(audioElement, source);
        // createMediaElementSource 会"接管"音频元素的输出，必须连接到 destination 才能播放
        source.connect(audioContext.destination);
      }

      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;

      // source 可以同时连接到多个目标节点（destination 用于播放，analyser 用于分析）
      source.connect(analyser);

      if (audioContext.state === "suspended") {
        audioContext.resume().catch(err => {
          console.warn("Failed to resume audio context:", err);
        });
      }

      audioElement.volume = volume;
      if (currentTime !== audioElement.currentTime) {
        audioElement.currentTime = currentTime;
      }

      if (wasPlaying) {
        // 使用 setTimeout 确保连接完成后再播放
        timeoutRef.current = setTimeout(() => {
          audioElement.play().catch(err => {
            console.warn("Failed to resume playback:", err);
          });
        }, 0);
      }

      analyserRef.current = analyser;
      canvas.width = width;
      canvas.height = height;

      const draw = () => {
        if (!analyser || !ctx) return;

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyser.getByteFrequencyData(dataArray);

        ctx.clearRect(0, 0, width, height);

        const WAVEFORM_HEIGHT_SCALE_FACTOR = 0.8;
        const barWidth = width / barCount;
        const barGap = barWidth * 0.2;
        const actualBarWidth = barWidth - barGap;

        for (let i = 0; i < barCount; i++) {
          const dataIndex = Math.floor((i / barCount) * bufferLength);
          const barHeight = (dataArray[dataIndex] / 255) * height * WAVEFORM_HEIGHT_SCALE_FACTOR;

          const x = i * barWidth + barGap / 2;
          const y = height - barHeight;

          ctx.fillStyle = barColor;
          ctx.fillRect(x, y, actualBarWidth, barHeight);
        }

        animationFrameRef.current = requestAnimationFrame(draw);
      };

      draw();
    } catch (error) {
      console.error("Failed to create audio context:", error);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      // 断开 analyser 连接，保持 source -> destination 连接以继续播放
      if (analyserRef.current && source) {
        try {
          source.disconnect(analyserRef.current);
        } catch (error) {
          console.warn("Failed to disconnect analyser:", error);
        }
      }
      analyserRef.current = null;
    };
  }, [audioElement, width, height, barCount, barColor]);

  return <canvas ref={canvasRef} className="rounded-md" style={{ width, height }} />;
};

export default AudioWaveform;
