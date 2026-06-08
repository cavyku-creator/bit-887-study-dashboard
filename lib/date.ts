const dateFormatter = new Intl.DateTimeFormat("zh-CN", {
  year: "numeric",
  month: "long",
  day: "numeric",
  timeZone: "Asia/Shanghai",
  weekday: "long"
});

const isoDateFormatter = new Intl.DateTimeFormat("en-CA", {
  day: "2-digit",
  month: "2-digit",
  timeZone: "Asia/Shanghai",
  year: "numeric"
});

export function todayISO() {
  return isoDateFormatter.format(new Date());
}

export function formatChineseDate(date = new Date()) {
  return dateFormatter.format(date);
}

export function daysUntil(target: string) {
  const today = new Date(todayISO());
  const end = new Date(target);
  return Math.max(0, Math.ceil((end.getTime() - today.getTime()) / 86_400_000));
}

export function daysBetween(start: string, end: string) {
  const startDate = new Date(start);
  const endDate = new Date(end);
  return Math.floor((endDate.getTime() - startDate.getTime()) / 86_400_000);
}

export function percent(done: number, total: number) {
  if (total === 0) return 0;
  return Math.round((done / total) * 100);
}
