export * from "./time";

/**
 * 移除文本中的html标签，用于搜索结果标题处理的场景
 */
export function stripHtml(htmlString: string) {
  if (!htmlString) return "";

  if (/<[^>]+>/.test(htmlString)) {
    try {
      const doc = new DOMParser().parseFromString(htmlString, "text/html");
      return doc.body.textContent || "";
    } catch {
      let sanitized = htmlString;
      let prev;
      do {
        prev = sanitized;
        sanitized = sanitized.replace(/<[^>]+>/g, "");
      } while (sanitized !== prev);
      return sanitized;
    }
  }

  return htmlString;
}
export * from "./number";
