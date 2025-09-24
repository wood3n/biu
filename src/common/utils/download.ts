export function downloadByUrl(url: string) {
  const link = document.createElement("a");
  link.href = url;
  link.download = "";
  link.target = "_blank";
  link.rel = "noreferrer noopener";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
