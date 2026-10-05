import { audio } from "@/store/play-list";

let audioContext: AudioContext | null = null;
let analyser: AnalyserNode | null = null;
let source: MediaElementAudioSourceNode | null = null;
let initAttempted = false;

interface SharedAnalyser {
  audioContext: AudioContext;
  analyser: AnalyserNode;
}

/**
 * 共享 AnalyserNode 单例。
 *
 * 从 audio-waveform 组件抽出，供频谱可视化 + 跑马灯节拍检测共用。
 * 关键陷阱：createMediaElementSource 对同一 audio 元素一生只能调一次，
 * 第二次会抛 InvalidStateError，因此用 initAttempted 标志保证幂等。
 */
export function getSharedAnalyser(): SharedAnalyser | null {
  if (!initAttempted) {
    initAttempted = true;
    try {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.8;

      try {
        source = audioContext.createMediaElementSource(audio);
        source.connect(analyser);
        analyser.connect(audioContext.destination);
      } catch {
        // MediaElementSourceNode 可能已被 audio-waveform 组件创建过，
        // 此时 analyser 仍然可用（只是没有 source → analyser 连线）。
        // audio-waveform 组件已统一走此共享入口，此分支不会命中。
      }
    } catch (error) {
      console.error("[shared-analyser] init failed:", error);
      audioContext = null;
      analyser = null;
    }
  }

  if (!audioContext || !analyser) return null;
  return { audioContext, analyser };
}

/**
 * 恢复 AudioContext（从 suspended 状态）。
 * 浏览器策略要求由用户手势链路触发，此处只做被动 resume。
 */
export function resumeSharedAnalyser(): void {
  if (audioContext?.state === "suspended") {
    void audioContext.resume();
  }
}
