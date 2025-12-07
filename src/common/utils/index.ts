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
      // 3. 兜底方案（万一在非浏览器环境或报错，回退到正则）
      console.warn("DOMParser failed, using regex fallback");
      return htmlString.replace(/<[^>]+>/g, "");
    }
  }

  return htmlString;
}
