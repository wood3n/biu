export interface PlayingMV {
  /**
   * 视频标题
   */
  title: string;
  /**
   * 歌手
   */
  singer: string;
  /**
   * 视频 bvid
   */
  bvid: string;
  /**
   * 封面
   */
  coverImageUrl: string;
  /**
   * B站链接
   */
  videoLink?: string;
  /**
   * up mid
   */
  upMid?: number;
  /**
   * up 昵称
   */
  upName?: string;
  /**
   * 当前播放的分集索引，从1开始
   */
  currentPage: number;
  /**
   * 视频分集
   */
  pages?: PageData[];
  /**
   * 播放链接
   */
  url?: string;
}

export interface PageData {
  /**
   * 分集 cid
   */
  pageCid: number;
  /**
   * 分集标题
   */
  pageTitle: string;
  /**
   * 分集索引，从1开始
   */
  pageIndex: number;
  /**
   * 分集第一帧图片
   */
  pageFirstFrameImageUrl: string;
}
