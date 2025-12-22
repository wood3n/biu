type GeetestProduct = "float" | "popup" | "custom" | "bind";

type GeetestLanguage = "zh-cn";

interface GeetestInitOptionsBase {
  gt: string;
  challenge: string;
  offline: boolean;
  new_captcha: boolean;
  product?: GeetestProduct;
  width?: string;
  lang?: GeetestLanguage;
  https?: boolean;
  timeout?: number;
  remUnit?: number;
  zoomEle?: string | Element;
  hideSuccess?: boolean;
  hideClose?: boolean;
  hideRefresh?: boolean;
  api_server?: string;
  api_server_v3?: string[];
}

interface GeetestInitOptionsPopupOrBind extends GeetestInitOptionsBase {
  product?: "popup" | "bind";
  area?: string | Element;
  next_width?: string;
  bg_color?: string;
}

interface GeetestInitOptionsFloat extends GeetestInitOptionsBase {
  product?: "float";
  next_width?: string;
}

interface GeetestInitOptionsCustom extends GeetestInitOptionsBase {
  product: "custom";
  area: string | Element;
  next_width?: string;
  bg_color?: string;
}

type GeetestInitOptions =
  | GeetestInitOptionsCustom
  | GeetestInitOptionsPopupOrBind
  | GeetestInitOptionsFloat
  | GeetestInitOptionsBase;

interface GeetestValidate {
  challenge?: string;
  validate?: string;
  seccode?: string;
  geetest_challenge?: string;
  geetest_validate?: string;
  geetest_seccode?: string;
}

interface GeetestValidateError {
  error_code: number;
  msg: string;
}

interface GeetestCaptcha {
  appendTo(target: string | Element): GeetestCaptcha;
  bindForm(target: string | Element): GeetestCaptcha;
  onReady(cb: () => void): GeetestCaptcha;
  onSuccess(cb: () => void): GeetestCaptcha;
  onError(cb: (error?: GeetestValidateError) => void): GeetestCaptcha;
  onClose(cb: () => void): GeetestCaptcha;
  verify(): void;
  getValidate(): GeetestValidate | null | false;
  reset?(): void;
  destroy?(): void;
}

type InitGeetestCallback = (captchaObj: GeetestCaptcha) => void;

declare global {
  interface Window {
    initGeetest(config: GeetestInitOptions, callback: InitGeetestCallback): void;
  }
}

export {};
