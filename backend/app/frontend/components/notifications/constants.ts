import type { CustomIntervalUnit, LookbackType, Recurrence } from "./types"

export const RECURRENCE_LABELS: Record<Recurrence, string> = {
  daily_weekdays: "Every weekday",
  weekly: "Weekly",
  monthly_dom: "Monthly on specific day",
  custom: "Custom cadence",
}

export const LOOKBACK_LABELS: Record<LookbackType, string> = {
  day: "Last day",
  week: "Last week",
  month: "Last month",
  half_year: "Last half-year",
  year: "Last year",
  custom_days: "Custom (days)",
}

export const UNIT_LABELS: Record<CustomIntervalUnit, string> = {
  days: "Days",
  weeks: "Weeks",
  months: "Months",
}

export const WEEKDAY_INDEX: Record<string, number> = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
}

