import { formatUrlProtocal } from "@/common/utils/url";

import { axiosInstance } from "./request";

export interface GetLyricsByBiliAIResponse {
  font_size?: number;
  font_color?: string;
  background_alpha?: number;
  background_color?: string;
  Stroke?: string;
  type?: string;
  lang?: string;
  version?: string;
  body?: Body[];
}

export interface Body {
  /** 起始时间，秒，2位小数，例如 55.36 */
  from?: number;
  /** 结束时间，秒 */
  to?: number;
  /** 索引，从1开始 */
  sid?: number;
  location?: number;
  content?: string;
  /** AI生成的匹配度0-1小数，例如：0.9999999561403529 */
  music?: number;
}

export function getLyric(url: string) {
  return axiosInstance.get<GetLyricsByBiliAIResponse>(formatUrlProtocal(url)!);
}
