import { searchRequest } from "./request";

/**
 * 获取搜索建议关键词(web端) - 请求参数
 * GET https://s.search.bilibili.com/main/suggest
 */
export interface SearchSuggestMainParams {
  /** 需要获得建议的输入内容（必要） */
  term: string;
  /** 版本号，默认 v1 */
  main_ver?: string; // v1
  /** 高亮标识，默认空 */
  highlight?: string;
  /** 函数名，默认 suggest */
  func?: string; // suggest
  /** 建议类型，默认 accurate */
  suggest_type?: string; // accurate
  /** 子类型，默认 tag */
  sub_type?: string; // tag
  /** 当前用户 mid（用于个性化推荐，可选） */
  userid?: number;
  /** 番剧累积数，默认 1 */
  bangumi_acc_num?: number; // 1
  /** 特殊累积数，默认 1 */
  special_acc_num?: number; // 1
  /** 话题累积数，默认 1 */
  topic_acc_num?: number; // 1
  /** UP 主累积数，默认 1 */
  upuser_acc_num?: number; // 1
  /** Tag 数，默认 10 */
  tag_num?: number; // 10
  /** 特殊推荐数，默认 10 */
  special_num?: number; // 10
  /** 番剧推荐数，默认 10 */
  bangumi_num?: number; // 10
  /** UP 主推荐数，默认 3 */
  upuser_num?: number; // 3
  /** 一个随机浮点数（Math.random()） */
  rnd?: number;
  /** 同 Cookie 中 buvid3 */
  buvid?: string;
  /** 埋点，默认 333.1007 */
  spmid?: string; // 333.1007
}

/**
 * 搜索建议关键词(web端) - 顶层响应
 */
export interface SearchSuggestMainResponse {
  /** 实验字符串（作用尚不明确） */
  exp_str?: string;
  /** 返回值：0 成功 */
  code: number;
  /** 搜索建议结果 */
  result: SearchSuggestMainResult;
  /** stoken（作用尚不明确） */
  stoken?: string;
}

/**
 * 搜索建议关键词(web端) - 结果对象
 */
export interface SearchSuggestMainResult {
  /** 建议关键词列表（最多 10 条） */
  tag: SearchSuggestTag[];
}

/**
 * 单条建议关键词条目
 */
export interface SearchSuggestTag {
  /** 关键词内容 */
  value: string;
  /** 未知字段，常见值 0 */
  ref: number;
  /** 显示内容（包含 <em class="suggest_high_light"> 高亮标签） */
  name: string;
  /** 未知字段，常见值 5 */
  spid: number;
  /** 类型（通常为空字符串） */
  type: string;
  /** 有些返回中还包含原始 term，容错为可选 */
  term?: string;
}

/**
 * 获取搜索建议关键词(web端)
 * - 说明：此接口不需要 WBI 加签；最多返回 10 个候选关键词
 * - 注意：直接使用绝对 URL 访问 s.search.bilibili.com 域名
 */
export async function getSearchSuggestMain(params: SearchSuggestMainParams): Promise<SearchSuggestMainResponse> {
  return searchRequest.get<SearchSuggestMainResponse>("/main/suggest", {
    params,
  });
}
