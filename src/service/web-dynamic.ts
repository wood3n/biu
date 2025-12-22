import { apiRequest } from "./request";

/**
 * 获取全部动态列表 - 请求参数
 */
export interface WebDynamicFeedAllParams {
  timezone_offset?: number; // 时区偏移量, 默认 -480
  type?: "all" | "video" | "pgc" | "article"; // 动态类型
  host_mid?: number; // UP主UID (仅新版)
  offset?: string; // 分页偏移量, 默认为空, 翻页时使用
  update_baseline?: string; // 更新基线, 获取新动态时使用
  page?: number; // 页数 (无效参数)
  platform?: string; // 平台, 如 web
  features?: string; // 功能开关
  web_location?: string; // 仅新版存在
}

/**
 * 获取用户空间动态 - 请求参数
 */
export interface WebDynamicFeedSpaceParams {
  offset?: string; // 分页偏移量
  host_mid: number; // 用户UID (必须)
  timezone_offset?: number; // 时区偏移量, 默认 -480
  features?: string; // 功能开关
}

/**
 * 检测是否有新动态 - 请求参数 (推测)
 */
export interface WebDynamicFeedAllUpdateParams {
  offset?: string; // 偏移量 (通常传入 update_baseline)
  timezone_offset?: number;
  features?: string;
}

/**
 * 通用响应结构
 */
export interface WebDynamicResponse<T> {
  code: number;
  message: string;
  ttl: number;
  data: T;
}

/**
 * 动态列表数据
 */
export interface WebDynamicFeedData {
  has_more: boolean;
  items: WebDynamicItem[];
  offset: string; // 下一页偏移量
  update_baseline: string; // 更新基线 (第一条记录ID)
  update_num: number; // 新动态数量
}

/**
 * 动态项
 */
export interface WebDynamicItem {
  basic: {
    comment_id_str: string;
    comment_type: number;
    like_icon: {
      action_url: string;
      end_url: string;
      id: number;
      start_url: string;
    };
    rid_str: string;
  };
  id_str: string;
  modules: {
    module_author: ModuleAuthor;
    module_dynamic: ModuleDynamic;
    module_more?: ModuleMore;
    module_stat?: ModuleStat;
    module_interaction?: ModuleInteraction;
    module_fold?: any;
    module_dispute?: any;
    module_tag?: any;
  };
  type: string;
  visible: boolean;
  orig?: WebDynamicItem; // 转发的原动态
}

// --- Modules ---

export interface ModuleAuthor {
  avatar?: any;
  face: string;
  face_nft: boolean;
  following: boolean | null;
  jump_url: string;
  label: string;
  mid: number;
  name: string;
  official_verify?: {
    desc: string;
    type: number;
  };
  pendant?: {
    expire: number;
    image: string;
    image_enhance: string;
    image_enhance_frame: string;
    name: string;
    pid: number;
    n_pid: number;
  };
  pub_action: string;
  pub_location_text: string;
  pub_time: string;
  pub_ts: number;
  type: string;
  vip?: {
    avatar_subscript: number;
    avatar_subscript_url: string;
    due_date: number;
    label: {
      bg_color: string;
      bg_style: number;
      border_color: string;
      img_label_uri_hans: string;
      img_label_uri_hans_static: string;
      img_label_uri_hant: string;
      img_label_uri_hant_static: string;
      label_theme: string;
      path: string;
      text: string;
      text_color: string;
      use_img_label: boolean;
    };
    nickname_color: string;
    status: number;
    theme_type: number;
    type: number;
  };
  decorate?: {
    card_url: string;
    fan: {
      color: string;
      color_format: {
        colors: string[];
        end_point: string;
        gradients: number[];
        start_point: string;
      };
      is_fan: boolean;
      num_str: string;
      number: number;
    };
    id: number;
    jump_url: string;
    name: string;
    type: number;
  };
  nft_info?: {
    region_icon: string;
    region_type: number;
    show_status: number;
  };
}

export interface ModuleDynamic {
  additional?: {
    common?: {
      button?: {
        jump_style?: { icon_url: string; text: string };
        jump_url: string;
        type: number;
        check?: { icon_url: string; text: string };
        status?: number;
        uncheck?: { icon_url: string; text: string };
      };
      cover: string;
      desc1: string;
      desc2: string;
      head_text: string;
      id_str: string;
      jump_url: string;
      style: number;
      sub_type: string;
      title: string;
    };
    type: string;
    reserve?: any;
    goods?: any;
    vote?: any;
    ugc?: any;
  };
  desc?: {
    rich_text_nodes: RichTextNode[];
    text: string;
  };
  major?: {
    type: string;
    archive?: MajorArchive;
    ugc_season?: any;
    article?: any;
    draw?: {
      id: number;
      items: {
        height: number;
        size: number;
        src: string;
        tags: any[];
        width: number;
      }[];
    };
    live_rcmd?: any;
    common?: any;
    pgc?: any;
    courses?: any;
    music?: any;
    opus?: {
      fold_action: any[];
      jump_url: string;
      pics: {
        height: number;
        size: number;
        src: string;
        width: number;
      }[];
      summary: {
        rich_text_nodes: RichTextNode[];
        text: string;
      };
      title: string | null;
    };
    live?: any;
    none?: any;
  };
  topic?: {
    id: number;
    jump_url: string;
    name: string;
  };
}

export interface MajorArchive {
  aid: string;
  badge: {
    bg_color: string;
    color: string;
    text: string;
  };
  bvid: string;
  cover: string;
  desc: string;
  disable_preview: number;
  duration_text: string;
  jump_url: string;
  stat: {
    danmaku: string;
    play: string;
  };
  title: string;
  type: number;
}

export interface RichTextNode {
  orig_text: string;
  text: string;
  type: string;
  rid?: string;
  emoji?: {
    icon_url: string;
    size: number;
    text: string;
    type: number;
  };
  jump_url?: string;
  goods?: any;
  icon_name?: string;
}

export interface ModuleMore {
  three_point_items: {
    label: string;
    type: string;
    modal?: {
      cancel: string;
      confirm: string;
      content: string;
      title: string;
    };
    params?: {
      dynamic_id?: string;
      status?: boolean;
    };
  }[];
}

export interface ModuleStat {
  comment: {
    count: number;
    forbidden: boolean;
    hidden?: boolean;
  };
  forward: {
    count: number;
    forbidden: boolean;
  };
  like: {
    count: number;
    forbidden: boolean;
    status: boolean;
  };
}

export interface ModuleInteraction {
  items: {
    desc: {
      rich_text_nodes: RichTextNode[];
      text: string;
    };
    type: number;
  }[];
}

/**
 * 获取全部动态列表
 */
export const getWebDynamicFeedAll = (params: WebDynamicFeedAllParams) => {
  return apiRequest.get<WebDynamicResponse<WebDynamicFeedData>>("/x/polymer/web-dynamic/v1/feed/all", {
    params,
  });
};

/**
 * 检测是否有新动态
 * 注意：接口参数和返回结构可能需要根据实际抓包确认，此处基于常规推断
 */
export const getWebDynamicFeedAllUpdate = (params: WebDynamicFeedAllUpdateParams) => {
  return apiRequest.get<WebDynamicResponse<WebDynamicFeedData>>("/x/polymer/web-dynamic/v1/feed/all/update", {
    params,
  });
};

/**
 * 获取用户空间动态
 */
export const getWebDynamicFeedSpace = (params: WebDynamicFeedSpaceParams) => {
  return apiRequest.get<WebDynamicResponse<WebDynamicFeedData>>("/x/polymer/web-dynamic/v1/feed/space", {
    params,
  });
};
