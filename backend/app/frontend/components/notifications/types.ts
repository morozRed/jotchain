export type Recurrence = "daily_weekdays" | "weekly" | "monthly_dom" | "custom"

export type CustomIntervalUnit = "days" | "weeks" | "months"

export type LookbackType =
  | "day"
  | "week"
  | "month"
  | "half_year"
  | "year"
  | "custom_days"

export interface NotificationSchedulePayload {
  id: string
  name: string
  enabled: boolean
  channel: string
  timezone: string
  timeOfDay: string | null
  recurrence: Recurrence
  weeklyDay: number | null
  dayOfMonth: number | null
  customIntervalValue: number | null
  customIntervalUnit: CustomIntervalUnit | null
  lookbackType: LookbackType
  lookbackDays: number | null
  leadTimeMinutes: number
  nextOccurrences: string[]
  createdAt: string
}

export interface MetaPayload {
  timezone: string
  timezonePresets: string[]
  weekdayOptions: { value: number; label: string }[]
  recurrenceOptions: Recurrence[]
  customIntervalUnitOptions: CustomIntervalUnit[]
  lookbackPresets: Exclude<LookbackType, "custom_days">[]
  defaultWeeklyDay: number
}

export interface NotificationFormData {
  name: string
  channel: string
  enabled: boolean
  timezone: string
  time_of_day: string
  recurrence: Recurrence
  weekly_day: number | null
  day_of_month: number | null
  custom_interval_value: number | null
  custom_interval_unit: CustomIntervalUnit | null
  lookback_type: LookbackType
  lookback_days: number | null
  lead_time_minutes: number
}

