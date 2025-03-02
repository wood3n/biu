import { addToast } from "@heroui/react";

export function checkError(err: unknown) {
  if (err instanceof Error) {
    addToast({
      title: err.message,
      color: "danger",
    });
  } else if (typeof err === "string") {
    addToast({
      title: err,
      color: "danger",
    });
  }
}
