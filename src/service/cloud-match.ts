import request from './request';

export interface CloudMatchRequestData {
  uid: number | undefined;
  sid: number | undefined;
  asid: number | undefined;
}

/*
 * 对云盘歌曲信息匹配纠正,如需取消匹配,asid 需要传 0
 */
export const postCloudMatch = (data: CloudMatchRequestData) => request.post('/cloud/match', data);
