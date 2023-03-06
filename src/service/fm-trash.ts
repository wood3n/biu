import request from './request';

export interface fm_trashRequestParams {
  id: number | undefined;
}

/*
 * 从私人 FM 中移除至垃圾桶
 */
export const getFmTrash = (params: fm_trashRequestParams) => request.get('/fm_trash', { params });
