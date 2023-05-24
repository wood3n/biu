import localforage from 'localforage';

/**
 * 存储key
 */
export enum STORAGE_ITEM {
  MENU_COLLAPSED = 'collapsed',
  SEARCH_KEY = 'search_key'
}

export const update = (key: STORAGE_ITEM, content: unknown) => localforage.setItem(key, content);

export const remove = (key: STORAGE_ITEM) => localforage.removeItem(key);
