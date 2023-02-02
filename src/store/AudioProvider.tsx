import React, { createContext } from 'react';

interface ContextType {
  song?: API.Song;
}

interface Props {
  children?: React.ReactNode;
}

export const AudioContext = createContext<ContextType>({});

/**
 * 音频队列
 */
const AudioProvider: React.FC<Props> = ({
  children
}) => {
  return (
    <AudioContext.Provider value={{ song: { } }}>
      {children}
    </AudioContext.Provider>
  );
};

export default AudioProvider;
