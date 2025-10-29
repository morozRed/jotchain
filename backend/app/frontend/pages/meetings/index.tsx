import { Head, useForm, usePage } from "@inertiajs/react"
import { CalendarDays, Clock } from "lucide-react"
import { useEffect, useMemo, type ReactNode } from "react"

import InputError from "@/components/input-error"
import AppLayout from "@/layouts/app-layout"
import type { SharedData } from "@/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { meetingsPath } from "@/routes"

type MeetingScheduleOption = {
  value: string
  label: string
}

type MeetingSchedulePayload = {
  id: number
  meetingType: string
  name: string
  cadence: string
  enabled: boolean
  timeOfDay?: string | null
  timezone: string
  weeklyDay?: number | null
  monthlyWeek?: number | null
  leadTimeMinutes: number
}

type UpcomingSummaryPayload = {
  scheduleId: number
  meetingType: string
  name: string
  cadence: string
  summaryAt: string
  summaryAtLabel: string
  meetingAtLabel: string
}

type MeetingScheduleMeta = {
  timezone: string
  meetingTypes: MeetingScheduleOption[]
}

type PageProps = SharedData & {
  meetingSchedules: MeetingSchedulePayload[]
  meetingScheduleMeta: MeetingScheduleMeta
  upcomingSummaries: UpcomingSummaryPayload[]
}

const WEEKDAY_OPTIONS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
]

const MONTH_WEEK_OPTIONS = [
  { value: "1", label: "First" },
  { value: "2", label: "Second" },
  { value: "3", label: "Third" },
  { value: "4", label: "Fourth" },
  { value: "5", label: "Fifth" },
]

const MEETING_ACCENTS: Record<string, string> = {
  daily_standup:
    "bg-gradient-to-br from-[#fff4ee] to-[#ffe5db] text-[#28150f] dark:from-[#2a1611] dark:to-[#361a13] dark:text-[#FCEEE5]",
  weekly_sync:
    "bg-gradient-to-br from-[#eef4ff] to-[#e0e9ff] text-[#101831] dark:from-[#1b2338] dark:to-[#12192c] dark:text-[#E5ECFF]",
  monthly_review:
    "bg-gradient-to-br from-[#f6f3ff] to-[#ece4ff] text-[#1a1331] dark:from-[#251c3a] dark:to-[#1b1430] dark:text-[#F0E9FF]",
}

const TIMEZONE_PRESETS = [
  "UTC",
  "America/Los_Angeles",
  "America/New_York",
  "Europe/London",
  "Europe/Berlin",
  "Asia/Singapore",
]

const breadcrumbs = [
  {
    title: "Meetings",
    href: meetingsPath(),
  },
]

export default function Meetings() {
  const { props } = usePage<PageProps>()
  const { meetingSchedules, meetingScheduleMeta, upcomingSummaries } = props

  const upcomingBySchedule = useMemo(() => {
    const map = new Map<number, UpcomingSummaryPayload>()
    upcomingSummaries.forEach((summary) => {
      map.set(summary.scheduleId, summary)
    })
    return map
  }, [upcomingSummaries])

  const timezoneOptions = useMemo(() => {
    const options = new Set<string>([
      meetingScheduleMeta.timezone,
      ...TIMEZONE_PRESETS,
    ])
    return Array.from(options)
  }, [meetingScheduleMeta.timezone])

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Meeting Schedules" />

      <div className="flex h-full flex-1 flex-col gap-6 px-4 pb-10 pt-6 md:px-6">
        <header className="flex flex-col gap-2">
          <div>
            <h1 className="text-2xl font-semibold leading-tight text-foreground md:text-3xl">
              Meeting Schedules
            </h1>
            <p className="text-muted-foreground mt-2 max-w-2xl text-sm md:text-base">
              Configure your meeting cadence for daily stand-ups, weekly syncs, and monthly reviews.
              AI summaries will be delivered to your inbox before each meeting.
            </p>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {meetingSchedules.map((schedule) => (
            <MeetingScheduleCard
              key={schedule.id}
              schedule={schedule}
              meta={meetingScheduleMeta}
              timezoneOptions={timezoneOptions}
              upcoming={upcomingBySchedule.get(schedule.id)}
            />
          ))}
        </div>

        {upcomingSummaries.length > 0 && (
          <div className="mt-4">
            <Card className="shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Clock className="size-5 text-primary" />
                  Upcoming summaries
                </CardTitle>
                <CardDescription>
                  AI briefs drop {` `}
                  <strong className="font-semibold text-foreground">
                    30 minutes before
                  </strong>{" "}
                  each session.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {upcomingSummaries.map((summary) => (
                  <div
                    key={summary.scheduleId}
                    className={cn(
                      "rounded-xl border p-4 shadow-xs hover:border-primary/50 hover:shadow-md",
                      MEETING_ACCENTS[summary.meetingType] ||
                        "bg-muted text-foreground",
                    )}
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        variant="secondary"
                        className="bg-white/20 text-xs font-semibold uppercase tracking-wide text-current"
                      >
                        {summary.name}
                      </Badge>
                      <span className="text-xs opacity-80">{summary.cadence}</span>
                    </div>
                    <div className="mt-3 space-y-2 text-sm">
                      <p className="font-semibold">
                        Summary delivers: {summary.summaryAtLabel}
                      </p>
                      <p className="text-xs opacity-80">
                        Meeting starts: {summary.meetingAtLabel}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AppLayout>
  )
}

type MeetingScheduleFormState = {
  meeting_schedule: {
    enabled: boolean
    time_of_day: string
    timezone: string
    weekly_day: number | null
    monthly_week: number | null
    lead_time_minutes: number
  }
}

function MeetingScheduleCard({
  schedule,
  meta,
  timezoneOptions,
  upcoming,
}: {
  schedule: MeetingSchedulePayload
  meta: MeetingScheduleMeta
  timezoneOptions: string[]
  upcoming?: UpcomingSummaryPayload
}) {
  const form = useForm<MeetingScheduleFormState>({
    meeting_schedule: {
      enabled: schedule.enabled,
      time_of_day: schedule.timeOfDay ?? "09:00",
      timezone: schedule.timezone || meta.timezone,
      weekly_day:
        schedule.weeklyDay !== null && schedule.weeklyDay !== undefined
          ? schedule.weeklyDay
          : 1,
      monthly_week:
        schedule.monthlyWeek !== null && schedule.monthlyWeek !== undefined
          ? schedule.monthlyWeek
          : 1,
      lead_time_minutes: schedule.leadTimeMinutes ?? 30,
    },
  })

  useEffect(() => {
    form.setData("meeting_schedule", {
      enabled: schedule.enabled,
      time_of_day: schedule.timeOfDay ?? "09:00",
      timezone: schedule.timezone || meta.timezone,
      weekly_day:
        schedule.weeklyDay !== null && schedule.weeklyDay !== undefined
          ? schedule.weeklyDay
          : 1,
      monthly_week:
        schedule.monthlyWeek !== null && schedule.monthlyWeek !== undefined
          ? schedule.monthlyWeek
          : 1,
      lead_time_minutes: schedule.leadTimeMinutes ?? 30,
    })
    form.clearErrors()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    schedule.enabled,
    schedule.timeOfDay,
    schedule.timezone,
    schedule.weeklyDay,
    schedule.monthlyWeek,
    schedule.leadTimeMinutes,
  ])

  const data = form.data.meeting_schedule

  const update = <K extends keyof MeetingScheduleFormState["meeting_schedule"]>(
    key: K,
    value: MeetingScheduleFormState["meeting_schedule"][K],
  ) => {
    form.setData("meeting_schedule", {
      ...data,
      [key]: value,
    })
  }

  const onSubmit: React.FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault()
    form.put(`/meeting_schedules/${schedule.id}`, {
      preserveScroll: true,
    })
  }

  const accentClasses =
    MEETING_ACCENTS[schedule.meetingType] ||
    "bg-muted/60 text-foreground border-border"

  const showWeekdaySelector =
    schedule.meetingType === "weekly_sync" ||
    schedule.meetingType === "monthly_review"
  const showMonthlySelector = schedule.meetingType === "monthly_review"

  return (
    <Card className={cn("border shadow-sm hover:shadow-md", accentClasses)}>
      <form onSubmit={onSubmit} className="flex flex-1 flex-col gap-4">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between gap-3 text-base font-semibold">
            <span>{schedule.name}</span>
            <div className="flex items-center gap-2 text-xs font-medium text-current">
              <Checkbox
                id={`schedule-${schedule.id}-enabled`}
                checked={data.enabled}
                onCheckedChange={(checked) =>
                  update("enabled", Boolean(checked))
                }
                className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              />
              <Label htmlFor={`schedule-${schedule.id}-enabled`}>
                {data.enabled ? "Enabled" : "Paused"}
              </Label>
            </div>
          </CardTitle>
          <CardDescription className="text-xs opacity-80">
            {schedule.cadence}. Emails send{" "}
            <strong className="font-semibold">
              {data.lead_time_minutes} minutes
            </strong>{" "}
            before the meeting.
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          <div className="grid gap-4">
            <FieldGroup>
              <Label htmlFor={`schedule-${schedule.id}-time`}>Time</Label>
              <Input
                id={`schedule-${schedule.id}-time`}
                type="time"
                value={data.time_of_day}
                onChange={(event) => update("time_of_day", event.target.value)}
                disabled={form.processing}
                aria-invalid={Boolean(form.errors.time_of_day)}
              />
              <InputError message={form.errors.time_of_day} />
            </FieldGroup>

            <FieldGroup>
              <Label htmlFor={`schedule-${schedule.id}-timezone`}>
                Time zone
              </Label>
              <Select
                value={data.timezone}
                onValueChange={(value) => update("timezone", value)}
                disabled={form.processing}
              >
                <SelectTrigger id={`schedule-${schedule.id}-timezone`} className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timezoneOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <InputError message={form.errors.timezone} />
            </FieldGroup>

            {showWeekdaySelector && (
              <FieldGroup>
                <Label htmlFor={`schedule-${schedule.id}-weekday`}>
                  Day of week
                </Label>
                <Select
                  value={String(data.weekly_day ?? 1)}
                  onValueChange={(value) =>
                    update("weekly_day", parseInt(value, 10))
                  }
                  disabled={form.processing}
                >
                  <SelectTrigger id={`schedule-${schedule.id}-weekday`} className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {WEEKDAY_OPTIONS.map((day, index) => (
                      <SelectItem key={day} value={String(index)}>
                        {day}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <InputError message={form.errors.weekly_day} />
              </FieldGroup>
            )}

            {showMonthlySelector && (
              <FieldGroup>
                <Label htmlFor={`schedule-${schedule.id}-month-week`}>
                  Week of month
                </Label>
                <Select
                  value={String(data.monthly_week ?? 1)}
                  onValueChange={(value) =>
                    update("monthly_week", parseInt(value, 10))
                  }
                  disabled={form.processing}
                >
                  <SelectTrigger id={`schedule-${schedule.id}-month-week`} className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MONTH_WEEK_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <InputError message={form.errors.monthly_week} />
              </FieldGroup>
            )}

            <FieldGroup>
              <Label htmlFor={`schedule-${schedule.id}-lead-time`}>
                Lead time (minutes)
              </Label>
              <Input
                id={`schedule-${schedule.id}-lead-time`}
                type="number"
                min={5}
                max={240}
                step={5}
                value={data.lead_time_minutes}
                onChange={(event) =>
                  update("lead_time_minutes", Number(event.target.value))
                }
                disabled={form.processing}
                aria-invalid={Boolean(form.errors.lead_time_minutes)}
              />
              <InputError message={form.errors.lead_time_minutes} />
            </FieldGroup>
          </div>

          {upcoming && (
            <div className="rounded-lg border border-white/30 bg-white/20 p-3 text-xs text-current shadow-xs dark:border-white/10 dark:bg-white/10">
              <div className="flex items-center gap-2 font-medium uppercase tracking-wide">
                <Clock className="size-4" />
                Next digest: {upcoming.summaryAtLabel}
              </div>
              <p className="mt-1 opacity-80">
                Meeting starts {upcoming.meetingAtLabel}
              </p>
            </div>
          )}
        </CardContent>

        <CardFooter className="justify-between border-t bg-background/30 py-4 text-xs text-muted-foreground">
          <span>
            Previews arrive in your inbox and Slack — adjust timing whenever your
            cadence shifts.
          </span>
          <Button
            type="submit"
            size="sm"
            className="bg-primary text-primary-foreground hover:bg-primary/80"
            disabled={form.processing}
          >
            {form.processing ? "Saving..." : "Save cadence"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

function FieldGroup({ children }: { children: ReactNode }) {
  return <div className="flex flex-col gap-2 text-sm">{children}</div>
}
