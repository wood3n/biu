import { message } from 'antd';

export const checkError = (err: unknown) => {
  if (err instanceof Error) {
    message.error(err.message);
  } else if (typeof err === 'string') {
    message.error(err);
  }
};