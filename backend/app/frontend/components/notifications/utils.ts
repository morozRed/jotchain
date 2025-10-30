import { LOOKBACK_LABELS, UNIT_LABELS, WEEKDAY_INDEX } from "./constants"
import type {
  MetaPayload,
  NotificationFormData,
  NotificationSchedulePayload,
} from "./types"

export function formDataFromSchedule(
  schedule: NotificationSchedulePayload,
  meta: MetaPayload,
): NotificationFormData {
  return {
    name: schedule.name,
    channel: schedule.channel,
    enabled: schedule.enabled,
    timezone: schedule.timezone || meta.timezone,
    time_of_day: schedule.timeOfDay ?? "09:00",
    recurrence: schedule.recurrence,
    weekly_day: schedule.weeklyDay ?? meta.defaultWeeklyDay,
    day_of_month: schedule.dayOfMonth ?? 1,
    custom_interval_value: schedule.customIntervalValue ?? 1,
    custom_interval_unit: schedule.customIntervalUnit ?? "weeks",
    lookback_type: schedule.lookbackType,
    lookback_days:
      schedule.lookbackType === "custom_days"
        ? schedule.lookbackDays ?? 7
        : null,
    lead_time_minutes: schedule.leadTimeMinutes ?? 30,
  }
}

export function isNotificationFormDataEqual(
  a: NotificationFormData,
  b: NotificationFormData,
): boolean {
  return (
    a.name === b.name &&
    a.channel === b.channel &&
    a.enabled === b.enabled &&
    a.timezone === b.timezone &&
    a.time_of_day === b.time_of_day &&
    a.recurrence === b.recurrence &&
    a.weekly_day === b.weekly_day &&
    a.day_of_month === b.day_of_month &&
    a.custom_interval_value === b.custom_interval_value &&
    a.custom_interval_unit === b.custom_interval_unit &&
    a.lookback_type === b.lookback_type &&
    a.lookback_days === b.lookback_days &&
    a.lead_time_minutes === b.lead_time_minutes
  )
}

export function buildDefaultFormData(meta: MetaPayload): NotificationFormData {
  return {
    name: buildSuggestedName({
      channel: "email",
      recurrence: "weekly",
      weekly_day: meta.defaultWeeklyDay,
      day_of_month: 1,
      custom_interval_value: null,
      custom_interval_unit: null,
      time_of_day: "09:00",
      lookback_type: "week",
      lookback_days: null,
    }),
    channel: "email",
    enabled: true,
    timezone: meta.timezone,
    time_of_day: "09:00",
    recurrence: "weekly",
    weekly_day: meta.defaultWeeklyDay,
    day_of_month: 1,
    custom_interval_value: 1,
    custom_interval_unit: "weeks",
    lookback_type: "week",
    lookback_days: null,
    lead_time_minutes: 30,
  }
}

export function buildSuggestedName(
  data: Pick<
    NotificationFormData,
    | "channel"
    | "recurrence"
    | "weekly_day"
    | "day_of_month"
    | "custom_interval_value"
    | "custom_interval_unit"
    | "time_of_day"
    | "lookback_type"
    | "lookback_days"
  >,
): string {
  const channelLabel = "Email"
  const timeLabel = data.time_of_day || "09:00"

  let cadenceLabel = "Custom cadence"

  if (data.recurrence === "daily_weekdays") {
    cadenceLabel = `Weekdays @ ${timeLabel}`
  } else if (data.recurrence === "weekly") {
    const weekday = lookupWeekday(data.weekly_day)
    cadenceLabel = `Weekly ${weekday} @ ${timeLabel}`
  } else if (data.recurrence === "monthly_dom") {
    cadenceLabel = `Monthly day ${data.day_of_month ?? 1} @ ${timeLabel}`
  } else if (data.recurrence === "custom") {
    const intervalValue = data.custom_interval_value ?? 1
    const intervalLabel = data.custom_interval_unit
      ? UNIT_LABELS[data.custom_interval_unit]
      : "interval"

    if (data.custom_interval_unit === "weeks") {
      const weekday = lookupWeekday(data.weekly_day)
      cadenceLabel = `Every ${intervalValue} ${intervalLabel.toLowerCase()} (${weekday}) @ ${timeLabel}`
    } else if (data.custom_interval_unit === "months") {
      cadenceLabel = `Every ${intervalValue} ${intervalLabel.toLowerCase()} (day ${
        data.day_of_month ?? 1
      }) @ ${timeLabel}`
    } else {
      cadenceLabel = `Every ${intervalValue} ${intervalLabel.toLowerCase()} @ ${timeLabel}`
    }
  }

  let summaryLabel = LOOKBACK_LABELS[data.lookback_type]

  if (data.lookback_type === "custom_days") {
    const days = data.lookback_days ?? 7
    summaryLabel = `Last ${days} days`
  }

  return `${channelLabel} • ${cadenceLabel} • ${summaryLabel}`
}

export function lookupWeekday(index: number | null | undefined): string {
  const fallback = "Monday"
  if (index == null) return fallback

  const entry = Object.entries(WEEKDAY_INDEX).find(([, value]) => value === index)
  return entry ? entry[0] : fallback
}

export function normalizePayload(data: NotificationFormData): NotificationFormData {
  const payload: NotificationFormData = { ...data }

  if (payload.recurrence !== "weekly" && payload.custom_interval_unit !== "weeks") {
    payload.weekly_day = null
  }

  if (
    payload.recurrence !== "monthly_dom" &&
    !(payload.recurrence === "custom" && payload.custom_interval_unit === "months")
  ) {
    payload.day_of_month = null
  }

  if (payload.recurrence !== "custom") {
    payload.custom_interval_value = null
    payload.custom_interval_unit = null
  }

  if (payload.lookback_type !== "custom_days") {
    payload.lookback_days = null
  }

  return payload
}

export function formatInTimeZone(isoString: string, timeZone: string): string {
  const date = new Date(isoString)
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date)
}

export function computePreviewOccurrences(
  data: NotificationFormData,
  limit = 3,
): string[] {
  const occurrences: Date[] = []
  let cursor = new Date()

  for (let i = 0; i < limit; i += 1) {
    const occurrence = computeNextOccurrence(data, cursor)
    if (!occurrence) break
    occurrences.push(occurrence)
    cursor = new Date(occurrence.getTime() + 1_000)
  }

  return occurrences.map((date) => formatInTimeZone(date.toISOString(), data.timezone))
}

function computeNextOccurrence(
  data: NotificationFormData,
  from: Date,
): Date | null {
  const tz = data.timezone
  const timeParts = parseTime(data.time_of_day || "09:00")
  const parts = getZonedParts(from, tz)
  const candidate = combine(parts, timeParts, tz)

  switch (data.recurrence) {
    case "daily_weekdays":
      return nextWeekdayOccurrence(candidate, tz, timeParts, from)
    case "weekly":
      return nextWeeklyOccurrence(
        candidate,
        tz,
        data.weekly_day ?? 1,
        1,
        timeParts,
        from,
      )
    case "monthly_dom":
      return nextMonthlyOccurrence(
        candidate,
        tz,
        data.day_of_month ?? 1,
        1,
        timeParts,
        from,
      )
    case "custom":
      return nextCustomOccurrence(data, candidate, tz, timeParts, from)
    default:
      return null
  }
}

function nextWeekdayOccurrence(
  candidate: Date,
  timeZone: string,
  timeParts: TimeOfDayParts,
  from: Date,
): Date {
  let current = candidate

  while (current <= from || isWeekend(current, timeZone)) {
    current = addDays(current, 1, timeZone, timeParts)
  }

  return current
}

function nextWeeklyOccurrence(
  candidate: Date,
  timeZone: string,
  targetWeekday: number,
  weekStep: number,
  timeParts: TimeOfDayParts,
  from: Date,
): Date {
  let current = candidate
  const currentWeekday = getZonedParts(candidate, timeZone).weekday
  const daysAhead = (targetWeekday - currentWeekday + 7) % 7

  if (daysAhead > 0) {
    current = addDays(current, daysAhead, timeZone, timeParts)
  }

  const stepDays = weekStep * 7

  while (current <= from) {
    current = addDays(current, stepDays, timeZone, timeParts)
  }

  return current
}

function nextMonthlyOccurrence(
  candidate: Date,
  timeZone: string,
  dayOfMonth: number,
  monthStep: number,
  timeParts: TimeOfDayParts,
  from: Date,
): Date {
  let current = alignToDayOfMonth(candidate, timeZone, dayOfMonth, timeParts)

  while (current <= from) {
    current = addMonths(current, monthStep, timeZone, dayOfMonth, timeParts)
  }

  return current
}

function nextCustomOccurrence(
  data: NotificationFormData,
  candidate: Date,
  timeZone: string,
  timeParts: TimeOfDayParts,
  from: Date,
): Date | null {
  const value = data.custom_interval_value ?? 1
  const unit = data.custom_interval_unit ?? "weeks"

  if (unit === "days") {
    let current = candidate
    while (current <= from) {
      current = addDays(current, value, timeZone, timeParts)
    }
    return current
  }

  if (unit === "weeks") {
    return nextWeeklyOccurrence(
      candidate,
      timeZone,
      data.weekly_day ?? 1,
      value,
      timeParts,
      from,
    )
  }

  if (unit === "months") {
    return nextMonthlyOccurrence(
      candidate,
      timeZone,
      data.day_of_month ?? 1,
      value,
      timeParts,
      from,
    )
  }

  return null
}

interface ZonedParts {
  year: number
  month: number
  day: number
  hour: number
  minute: number
  second: number
  weekday: number
}

interface TimeOfDayParts {
  hour: number
  minute: number
}

function parseTime(value: string): TimeOfDayParts {
  const [hourPart, minutePart] = value.split(":")
  return {
    hour: Number.parseInt(hourPart, 10) || 0,
    minute: Number.parseInt(minutePart, 10) || 0,
  }
}

function getZonedParts(date: Date, timeZone: string): ZonedParts {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    weekday: "long",
  })

  const parts = formatter.formatToParts(date)
  const lookup = Object.fromEntries(parts.map((part) => [part.type, part.value]))

  return {
    year: Number.parseInt(lookup.year, 10),
    month: Number.parseInt(lookup.month, 10),
    day: Number.parseInt(lookup.day, 10),
    hour: Number.parseInt(lookup.hour, 10),
    minute: Number.parseInt(lookup.minute, 10),
    second: Number.parseInt(lookup.second, 10),
    weekday: WEEKDAY_INDEX[lookup.weekday] ?? 0,
  }
}

function combine(parts: ZonedParts, time: TimeOfDayParts, timeZone: string): Date {
  return constructDate(parts.year, parts.month, parts.day, time.hour, time.minute, 0, timeZone)
}

function addDays(
  date: Date,
  days: number,
  timeZone: string,
  timeParts: TimeOfDayParts,
): Date {
  const parts = getZonedParts(date, timeZone)
  const nextDate = new Date(Date.UTC(parts.year, parts.month - 1, parts.day))
  nextDate.setUTCDate(nextDate.getUTCDate() + days)

  return constructDate(
    nextDate.getUTCFullYear(),
    nextDate.getUTCMonth() + 1,
    nextDate.getUTCDate(),
    timeParts.hour,
    timeParts.minute,
    0,
    timeZone,
  )
}

function addMonths(
  date: Date,
  months: number,
  timeZone: string,
  dayOfMonth: number,
  timeParts: TimeOfDayParts,
): Date {
  const parts = getZonedParts(date, timeZone)
  const totalMonths = parts.month - 1 + months
  const year = parts.year + Math.floor(totalMonths / 12)
  const month = (totalMonths % 12) + 1
  const day = normalizeDayOfMonth(year, month, dayOfMonth)

  return constructDate(year, month, day, timeParts.hour, timeParts.minute, 0, timeZone)
}

function alignToDayOfMonth(
  date: Date,
  timeZone: string,
  dayOfMonth: number,
  timeParts: TimeOfDayParts,
): Date {
  const parts = getZonedParts(date, timeZone)
  const day = normalizeDayOfMonth(parts.year, parts.month, dayOfMonth)
  const aligned = constructDate(
    parts.year,
    parts.month,
    day,
    timeParts.hour,
    timeParts.minute,
    0,
    timeZone,
  )

  if (aligned < date) {
    return addMonths(aligned, 1, timeZone, dayOfMonth, timeParts)
  }

  return aligned
}

function normalizeDayOfMonth(year: number, month: number, day: number): number {
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate()
  return Math.min(Math.max(day, 1), lastDay)
}

function constructDate(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  second: number,
  timeZone: string,
): Date {
  const utcDate = new Date(Date.UTC(year, month - 1, day, hour, minute, second))
  const offset = getOffsetMinutes(utcDate, timeZone)
  return new Date(utcDate.getTime() - offset * 60_000)
}

function getOffsetMinutes(date: Date, timeZone: string): number {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })

  const parts = formatter.formatToParts(date)
  const lookup = Object.fromEntries(parts.map((part) => [part.type, part.value]))

  const asUTC = Date.UTC(
    Number.parseInt(lookup.year, 10),
    Number.parseInt(lookup.month, 10) - 1,
    Number.parseInt(lookup.day, 10),
    Number.parseInt(lookup.hour, 10),
    Number.parseInt(lookup.minute, 10),
    Number.parseInt(lookup.second, 10),
  )

  return (asUTC - date.getTime()) / 60_000
}

function isWeekend(date: Date, timeZone: string): boolean {
  const weekday = getZonedParts(date, timeZone).weekday
  return weekday === 0 || weekday === 6
}
