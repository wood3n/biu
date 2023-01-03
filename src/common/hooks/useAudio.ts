import { useState } from 'react';

interface ReturnType {
  play?: (id: number) => void;
  song?: API.Song;
}

export interface AudioHook {
  (): ReturnType;
}

/**
 * 音频播放
 */
const useAudio: AudioHook = () => {
  const [song, setSong] = useState<API.Song>();

  return {
    song
  };
};

export default useAudio;