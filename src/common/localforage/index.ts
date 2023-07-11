import localforage from 'localforage';

export enum STORAGE_KEY {
  VOLUME = 'VOLUME',
  MUTED = 'MUTED',
  PLAY_CURRENT= 'PLAY_CURRENT',
  PLAY_RATE = 'PLAY_RATE',
  PLAY_QUEUE = 'PLAY_QUEUE',
  PLAY_MODE = 'PLAY_MODE'
}

export const getLocal = <T>(key: STORAGE_KEY) => localforage.getItem<T>(key);

export const updateLocal = <T>(key: STORAGE_KEY, content: T) => localforage.setItem(key, content);

export const removeLocal = (key: STORAGE_KEY) => localforage.removeItem(key);
