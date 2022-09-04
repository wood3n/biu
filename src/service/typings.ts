// eslint-disable-next-line @typescript-eslint/no-unused-vars
declare module API {
  interface SendCaptchaReqParam {
    phone: string;
  }

  interface SendCaptchaRes {
    phone: string;
  }

  interface PhoneLoginData {
    phone: string;
    captcha: string;
  }

  interface BaseRes {
    code: number;
    data: boolean;
  }

  interface User {
    username: string;
    name: string;
  }
}