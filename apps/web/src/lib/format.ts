export function formatDate(input?: string) {
  if (!input) {
    return "未发布";
  }

  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric"
  }).format(new Date(input));
}

export function formatNumber(value = 0) {
  return new Intl.NumberFormat("zh-CN", {
    notation: "compact"
  }).format(value);
}

