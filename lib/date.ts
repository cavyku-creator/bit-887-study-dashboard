const dateFormatter = new Intl.DateTimeFormat("zh-CN", {
  year: "numeric",
  month: "long",
  day: "numeric",
  weekday: "long"
});

export function todayISO() {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const local = new Date(now.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 10);
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
