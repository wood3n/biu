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

  interface QrLoginkey {
    data: {
      code: number;
      unikey: string;
    }
  }

  interface QrLoginImg {
    data: {
      /**
       * base64
       */
      qrimg: string;
      qrUrl: string;
    }
  }

  interface QrLoginRes {
    code: number;
    cookie: string;
    message: string;
  }

  interface Account {
    id: number;
  }

  interface Profile {
    userId: number;
  }

  interface UserAccount {
    account: Account;
    profile: Profile;
  }

  interface User {
    level: number;
  }
}

