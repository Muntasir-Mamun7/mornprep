import { format, startOfWeek, endOfWeek, differenceInDays, isToday } from "date-fns";

export function getCurrentWeekRange() {
  const now = new Date();
  const start = startOfWeek(now, { weekStartsOn: 6 });
  const end = endOfWeek(now, { weekStartsOn: 6 });
  return { start, end };
}

export function getDaysLeftInWeek(): number {
  const now = new Date();
  const { end } = getCurrentWeekRange();
  return differenceInDays(end, now);
}

export function formatDate(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export function formatDisplay(date: Date): string {
  return format(date, "EEE, MMM d");
}

export { isToday };
