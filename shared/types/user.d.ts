interface LevelInfo {
  current_level: number;
  current_min: number;
  current_exp: number;
  next_exp: number | string;
}

interface Official {
  role: number;
  title: string;
  desc: string;
  type: number;
}

interface OfficialVerify {
  type: number;
  desc: string;
}

interface Pendant {
  pid: number;
  name: string;
  image: string;
  expire: number;
  image_enhance?: string;
  image_enhance_frame?: string;
}

interface VipLabel {
  path: string;
  text: string;
  label_theme: string;
  text_color?: string;
  bg_style?: number;
  bg_color?: string;
  border_color?: string;
  use_img_label?: boolean;
  img_label_uri_hans?: string;
  img_label_uri_hant?: string;
  img_label_uri_hans_static?: string;
  img_label_uri_hant_static?: string;
}

interface Wallet {
  mid: number;
  bcoin_balance: number;
  coupon_balance: number;
  coupon_due_time: number;
}

interface WbiImg {
  img_url: string;
  sub_url: string;
}

interface UserInfo {
  isLogin: boolean; // 是否已登录 false:未登录 true:已登录
  email_verified: number; // 是否验证邮箱地址 0:未验证 1:已验证
  face: string; // 用户头像 url
  face_nft?: number; // 是否为 NFT 头像 0:不是 1:是
  face_nft_type?: number; // NFT 头像类型
  level_info: LevelInfo; // 等级信息
  mid: number; // 用户 mid
  mobile_verified: number; // 是否验证手机号 0:未验证 1:已验证
  money: number; // 拥有硬币数
  moral: number; // 当前节操值 上限为70
  official: Official; // 认证信息
  officialVerify: OfficialVerify; // 认证信息 2
  pendant: Pendant; // 头像框信息
  scores: number; // （？）
  uname: string; // 用户昵称
  vipDueDate: number; // 会员到期时间 毫秒时间戳
  vipStatus: number; // 会员开通状态 0:无 1:有
  vipType: number; // 会员类型 0:无 1:月度大会员 2:年度及以上大会员
  vip_pay_type: number; // 会员开通状态 0:无 1:有
  vip_theme_type: number; // （？）
  vip_label: VipLabel; // 会员标签
  vip_avatar_subscript: number; // 是否显示会员图标 0:不显示 1:显示
  vip_nickname_color: string; // 会员昵称颜色 颜色码
  wallet: Wallet; // B币钱包信息
  has_shop: boolean; // 是否拥有推广商品 false:无 true:有
  shop_url: string; // 商品推广页面 url
  allowance_count: number; // （？）
  answer_status: number; // （？）
  is_senior_member: number; // 是否硬核会员 0:非硬核会员 1:硬核会员
  wbi_img: WbiImg; // Wbi 签名实时口令 该字段即使用户未登录也存在
  is_jury: boolean; // 是否风纪委员 true:风纪委员 false:非风纪委员
}
