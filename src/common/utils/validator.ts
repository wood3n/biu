type Validator = (rule: unknown, value: string | number, callback: (error?: string) => void) => Promise<void | any> | void;

export const checkPhone = (input: string) => /1\d{10}/.test(input);

export const validatePhone: Validator = (_, input) => {
  if (checkPhone(input as string)) {
    return Promise.resolve();
  }
  return Promise.reject(new Error('请正确输入手机号'));
};

export const validateCaptcha: Validator = (_, input) => {
  if (/\d{4}/.test(input as string)) {
    return Promise.resolve();
  }
  return Promise.reject(new Error('请正确输入验证码'));
};

export function isThenable(thing?: any): boolean {
  return !!(thing && thing.then);
}
