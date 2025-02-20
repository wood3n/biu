import { message } from "antd";

export function checkError(err: unknown) {
  if (err instanceof Error) {
    message.error(err.message);
  } else if (typeof err === "string") {
    message.error(err);
  }
}
