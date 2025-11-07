export function sanitizeFilename(filename: string): string {
  return (
    filename
      .replace(/[<>:"|?*\\/]/g, "")
      // eslint-disable-next-line no-control-regex
      .replace(/[\x00-\x1f\x80-\x9f]/g, "")
      .replace(/^\.+/, "")
      .replace(/\.+$/, "")
      .replace(/\s+/g, " ")
      .trim()
      .substring(0, 200)
  );
}
