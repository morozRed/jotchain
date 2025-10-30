import { format } from "date-fns"

export interface TimezoneOption {
  value: string
  label: string
  offset: string
  region: string
}

/**
 * Get the user's current timezone using browser API
 */
export function getUserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone
  } catch {
    return "UTC"
  }
}

/**
 * Get timezone offset in format like "+05:00" or "-08:00"
 */
export function getTimezoneOffset(timezone: string): string {
  try {
    const now = new Date()
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      timeZoneName: "longOffset",
    })

    const parts = formatter.formatToParts(now)
    const offsetPart = parts.find((part) => part.type === "timeZoneName")

    if (offsetPart && offsetPart.value.startsWith("GMT")) {
      return offsetPart.value.replace("GMT", "UTC")
    }

    // Fallback: calculate offset manually
    const localDate = new Date(
      now.toLocaleString("en-US", { timeZone: timezone }),
    )
    const utcDate = new Date(now.toLocaleString("en-US", { timeZone: "UTC" }))
    const diff = (localDate.getTime() - utcDate.getTime()) / 1000 / 60 / 60

    const sign = diff >= 0 ? "+" : "-"
    const hours = Math.floor(Math.abs(diff))
    const minutes = Math.round((Math.abs(diff) - hours) * 60)

    return `UTC${sign}${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`
  } catch {
    return "UTC+00:00"
  }
}

/**
 * Extract region from IANA timezone (e.g., "America" from "America/New_York")
 */
export function getTimezoneRegion(timezone: string): string {
  const parts = timezone.split("/")
  return parts[0] || "Other"
}

/**
 * Format timezone display label with offset
 */
export function formatTimezoneLabel(timezone: string): string {
  const offset = getTimezoneOffset(timezone)
  const cityName = timezone.split("/").pop()?.replace(/_/g, " ") || timezone
  return `${cityName} (${offset})`
}

/**
 * Get all available timezones from browser
 */
export function getAllTimezones(): string[] {
  try {
    // Use modern Intl API if available
    if ("supportedValuesOf" in Intl) {
      return Intl.supportedValuesOf("timeZone")
    }
  } catch {
    // Fallback to empty array
  }

  // Fallback: return common timezones
  return [
    "UTC",
    "America/New_York",
    "America/Chicago",
    "America/Denver",
    "America/Los_Angeles",
    "America/Anchorage",
    "Pacific/Honolulu",
    "Europe/London",
    "Europe/Paris",
    "Europe/Berlin",
    "Europe/Moscow",
    "Asia/Dubai",
    "Asia/Kolkata",
    "Asia/Singapore",
    "Asia/Tokyo",
    "Australia/Sydney",
  ]
}

/**
 * Get all timezones grouped by region
 */
export function getGroupedTimezones(): Record<string, TimezoneOption[]> {
  const timezones = getAllTimezones()
  const grouped: Record<string, TimezoneOption[]> = {}

  for (const tz of timezones) {
    const region = getTimezoneRegion(tz)

    if (!grouped[region]) {
      grouped[region] = []
    }

    grouped[region].push({
      value: tz,
      label: formatTimezoneLabel(tz),
      offset: getTimezoneOffset(tz),
      region,
    })
  }

  // Sort each region's timezones by offset then name
  for (const region in grouped) {
    grouped[region].sort((a, b) => {
      // First sort by offset
      const offsetCompare = a.offset.localeCompare(b.offset)
      if (offsetCompare !== 0) return offsetCompare

      // Then sort by label
      return a.label.localeCompare(b.label)
    })
  }

  return grouped
}

/**
 * Get sorted list of regions
 */
export function getTimezoneRegions(): string[] {
  const grouped = getGroupedTimezones()
  const regions = Object.keys(grouped)

  // Define preferred order for major regions
  const preferredOrder = [
    "America",
    "Europe",
    "Asia",
    "Pacific",
    "Africa",
    "Atlantic",
    "Indian",
    "Antarctica",
  ]

  return regions.sort((a, b) => {
    const aIndex = preferredOrder.indexOf(a)
    const bIndex = preferredOrder.indexOf(b)

    // If both are in preferred order, sort by index
    if (aIndex !== -1 && bIndex !== -1) {
      return aIndex - bIndex
    }

    // If only one is in preferred order, it comes first
    if (aIndex !== -1) return -1
    if (bIndex !== -1) return 1

    // Otherwise sort alphabetically
    return a.localeCompare(b)
  })
}

/**
 * Search timezones by query string
 */
export function searchTimezones(query: string): TimezoneOption[] {
  if (!query) return []

  const lowerQuery = query.toLowerCase()
  const grouped = getGroupedTimezones()
  const results: TimezoneOption[] = []

  for (const region in grouped) {
    for (const tz of grouped[region]) {
      // Search in timezone value, label, and region
      if (
        tz.value.toLowerCase().includes(lowerQuery) ||
        tz.label.toLowerCase().includes(lowerQuery) ||
        tz.region.toLowerCase().includes(lowerQuery)
      ) {
        results.push(tz)
      }
    }
  }

  return results.slice(0, 50) // Limit results for performance
}
