import { type InertiaFormProps } from "@inertiajs/react"
import { CalendarDays } from "lucide-react"
import { type ReactNode } from "react"

import InputError from "@/components/input-error"
import { ComboboxTimezone } from "@/components/ui/combobox-timezone"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { TimePicker } from "@/components/ui/time-picker"
import { cn } from "@/lib/utils"

import { LOOKBACK_LABELS, RECURRENCE_LABELS, UNIT_LABELS } from "./constants"
import type {
  CustomIntervalUnit,
  LookbackType,
  MetaPayload,
  NotificationFormData,
  Recurrence,
} from "./types"
import { buildSuggestedName } from "./utils"

interface NotificationFormSectionsProps {
  form: InertiaFormProps<NotificationFormData>
  meta: MetaPayload
  idPrefix: string
  processing: boolean
  occurrences: string[]
}

export function NotificationFormSections({
  form,
  meta,
  idPrefix,
  processing,
  occurrences,
}: NotificationFormSectionsProps) {
  const recurrenceOptions = meta.recurrenceOptions.map((option) => (
    <SelectItem key={option} value={option}>
      {RECURRENCE_LABELS[option]}
    </SelectItem>
  ))

  const intervalUnitOptions = meta.customIntervalUnitOptions.map((unit) => (
    <SelectItem key={unit} value={unit}>
      {UNIT_LABELS[unit]}
    </SelectItem>
  ))

  const lookbackOptions = (Object.keys(LOOKBACK_LABELS) as LookbackType[]).map(
    (option) => (
      <SelectItem key={option} value={option}>
        {LOOKBACK_LABELS[option]}
      </SelectItem>
    ),
  )

  const showWeeklyDay =
    form.data.recurrence === "weekly" ||
    (form.data.recurrence === "custom" &&
      form.data.custom_interval_unit === "weeks")

  const showDayOfMonth =
    form.data.recurrence === "monthly_dom" ||
    (form.data.recurrence === "custom" &&
      form.data.custom_interval_unit === "months")

  return (
    <div className="space-y-6">
      <div className="space-y-6 lg:grid lg:grid-cols-2 lg:gap-8 lg:space-y-0">
        <FormSection
          title="Basics"
          description="Give the notification a readable name and control whether it is active."
          className="h-full"
        >
          <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-start">
            <FieldGroup>
              <Label htmlFor={`${idPrefix}-name`}>Name</Label>
              <Input
                id={`${idPrefix}-name`}
                value={form.data.name}
                onChange={(event) => form.setData("name", event.target.value)}
                aria-invalid={Boolean(form.errors.name)}
                placeholder="e.g., Weekly Monday standup summary"
                disabled={processing}
              />
              {!form.errors.name && !form.data.name && (
                <p className="text-xs text-muted-foreground">
                  Suggested: {buildSuggestedName(form.data)}
                </p>
              )}
              <InputError message={form.errors.name} />
            </FieldGroup>

            <div className="flex flex-col gap-2">
              <Label>Status</Label>
              <div className="flex h-9 items-center gap-3">
                <Switch
                  id={`${idPrefix}-enabled`}
                  checked={form.data.enabled}
                  onCheckedChange={(checked) =>
                    form.setData("enabled", Boolean(checked))
                  }
                  disabled={processing}
                />
                <Label
                  htmlFor={`${idPrefix}-enabled`}
                  className={cn(
                    "text-sm font-medium",
                    form.data.enabled ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  {form.data.enabled ? "Enabled" : "Paused"}
                </Label>
              </div>
            </div>
          </div>
        </FormSection>

        <FormSection
          title="Cadence"
          description="Set how often the notification fires."
          className="h-full"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <FieldGroup>
              <Label htmlFor={`${idPrefix}-recurrence`}>Recurrence</Label>
              <Select
                value={form.data.recurrence}
                onValueChange={(value: Recurrence) =>
                  handleRecurrenceChange(form, value, meta)
                }
                disabled={processing}
              >
                <SelectTrigger id={`${idPrefix}-recurrence`} className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>{recurrenceOptions}</SelectContent>
              </Select>
              <InputError message={form.errors.recurrence} />
            </FieldGroup>

            {showWeeklyDay ? (
              <FieldGroup>
                <Label htmlFor={`${idPrefix}-weekday`}>Day of week</Label>
                <Select
                  value={String(form.data.weekly_day ?? meta.defaultWeeklyDay)}
                  onValueChange={(value) =>
                    form.setData("weekly_day", Number.parseInt(value, 10))
                  }
                  disabled={processing}
                >
                  <SelectTrigger id={`${idPrefix}-weekday`} className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {meta.weekdayOptions.map((option) => (
                      <SelectItem key={option.value} value={String(option.value)}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <InputError message={form.errors.weekly_day} />
              </FieldGroup>
            ) : null}

            {showDayOfMonth ? (
              <FieldGroup>
                <Label htmlFor={`${idPrefix}-day-of-month`}>Day of month</Label>
                <Input
                  id={`${idPrefix}-day-of-month`}
                  type="number"
                  min={1}
                  max={31}
                  value={form.data.day_of_month ?? 1}
                  onChange={(event) =>
                    form.setData(
                      "day_of_month",
                      event.target.value === ""
                        ? null
                        : Number.parseInt(event.target.value, 10),
                    )
                  }
                  disabled={processing}
                  aria-invalid={Boolean(form.errors.day_of_month)}
                />
                <InputError message={form.errors.day_of_month} />
              </FieldGroup>
            ) : null}

            {form.data.recurrence === "custom" ? (
              <FieldGroup className="md:col-span-2">
                <Label>Custom interval</Label>
                <div className="grid gap-3 md:grid-cols-[150px,160px,1fr] md:items-center">
                  <Input
                    type="number"
                    min={1}
                    value={form.data.custom_interval_value ?? 1}
                    onChange={(event) =>
                      form.setData(
                        "custom_interval_value",
                        event.target.value === ""
                          ? null
                          : Number.parseInt(event.target.value, 10),
                      )
                    }
                    disabled={processing}
                    aria-invalid={Boolean(form.errors.custom_interval_value)}
                  />
                  <Select
                    value={form.data.custom_interval_unit ?? "weeks"}
                    onValueChange={(value: CustomIntervalUnit) =>
                      handleCustomUnitChange(form, value, meta)
                    }
                    disabled={processing}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>{intervalUnitOptions}</SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Runs every {form.data.custom_interval_value ?? 1}{" "}
                    {UNIT_LABELS[form.data.custom_interval_unit ?? "weeks"].toLowerCase()}.
                  </p>
                </div>
                <InputError message={form.errors.custom_interval_value} />
                <InputError message={form.errors.custom_interval_unit} />
              </FieldGroup>
            ) : null}
          </div>
        </FormSection>
      </div>

      <Separator className="md:hidden" />

      <div className="space-y-6 lg:grid lg:grid-cols-2 lg:gap-8 lg:space-y-0">
        <FormSection
          title="Delivery"
          description="Choose when emails send and how much lead time to include."
          className="h-full"
        >
          <div className="grid gap-4 md:grid-cols-1">
            <FieldGroup>
              <Label htmlFor={`${idPrefix}-timezone`}>Time zone</Label>
              <ComboboxTimezone
                value={form.data.timezone}
                onChange={(value) => form.setData("timezone", value)}
                disabled={processing}
              />
              <InputError message={form.errors.timezone} />
            </FieldGroup>

            <FieldGroup>
              <Label htmlFor={`${idPrefix}-time`}>Send time</Label>
              <TimePicker
                value={form.data.time_of_day}
                onChange={(value) => form.setData("time_of_day", value)}
                disabled={processing}
                placeholder="Select time"
              />
              <InputError message={form.errors.time_of_day} />
            </FieldGroup>

            <FieldGroup>
              <Label htmlFor={`${idPrefix}-lead-time`}>Lead time (minutes)</Label>
              <Input
                id={`${idPrefix}-lead-time`}
                type="number"
                min={0}
                max={1440}
                value={form.data.lead_time_minutes}
                onChange={(event) =>
                  form.setData(
                    "lead_time_minutes",
                    event.target.value === ""
                      ? 0
                      : Number.parseInt(event.target.value, 10),
                  )
                }
                disabled={processing}
                aria-invalid={Boolean(form.errors.lead_time_minutes)}
              />
              <InputError message={form.errors.lead_time_minutes} />
            </FieldGroup>
          </div>
        </FormSection>

        <FormSection
          title="Summary window"
          description="Decide how much history each email covers and preview upcoming sends."
          className="h-full"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <FieldGroup>
              <Label htmlFor={`${idPrefix}-lookback`}>Summary range</Label>
              <Select
                value={form.data.lookback_type}
                onValueChange={(value: LookbackType) =>
                  handleLookbackChange(form, value)
                }
                disabled={processing}
              >
                <SelectTrigger id={`${idPrefix}-lookback`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>{lookbackOptions}</SelectContent>
              </Select>
              <InputError message={form.errors.lookback_type} />
            </FieldGroup>

            {form.data.lookback_type === "custom_days" ? (
              <FieldGroup>
                <Label htmlFor={`${idPrefix}-lookback-days`}>
                  Number of days
                </Label>
                <Input
                  id={`${idPrefix}-lookback-days`}
                  type="number"
                  min={1}
                  max={365}
                  value={form.data.lookback_days ?? 7}
                  onChange={(event) =>
                    form.setData(
                      "lookback_days",
                      event.target.value === ""
                        ? null
                        : Number.parseInt(event.target.value, 10),
                    )
                  }
                  disabled={processing}
                  aria-invalid={Boolean(form.errors.lookback_days)}
                />
                <InputError message={form.errors.lookback_days} />
              </FieldGroup>
            ) : null}
          </div>

          <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm">
            <div className="flex items-center gap-2 font-semibold text-foreground">
              <CalendarDays className="h-4 w-4 text-primary" />
              <span>Next deliveries</span>
            </div>
            {occurrences.length ? (
              <ul className="mt-3 space-y-2">
                {occurrences.map((occurrence, index) => (
                  <li
                    key={`${occurrence}-${index}`}
                    className="flex items-start gap-2 text-foreground"
                  >
                    <span className="mt-1 flex size-1.5 shrink-0 rounded-full bg-primary" />
                    <span className="leading-relaxed">{occurrence}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-muted-foreground">
                Configure cadence and timing above to preview upcoming delivery dates.
              </p>
            )}
          </div>
        </FormSection>
      </div>
    </div>
  )
}

function handleRecurrenceChange(
  form: InertiaFormProps<NotificationFormData>,
  recurrence: Recurrence,
  meta: MetaPayload,
) {
  form.setData((data: NotificationFormData) => {
    const next: NotificationFormData = {
      ...data,
      recurrence,
    }

    if (recurrence === "weekly") {
      next.weekly_day = data.weekly_day ?? meta.defaultWeeklyDay
      next.day_of_month = data.day_of_month
      next.custom_interval_value = null
      next.custom_interval_unit = null
    } else if (recurrence === "monthly_dom") {
      next.day_of_month = data.day_of_month ?? 1
      next.weekly_day = data.weekly_day
      next.custom_interval_value = null
      next.custom_interval_unit = null
    } else if (recurrence === "custom") {
      next.custom_interval_value = data.custom_interval_value ?? 1
      next.custom_interval_unit = data.custom_interval_unit ?? "weeks"
      if (next.custom_interval_unit === "weeks") {
        next.weekly_day = data.weekly_day ?? meta.defaultWeeklyDay
      }
      if (next.custom_interval_unit === "months") {
        next.day_of_month = data.day_of_month ?? 1
      }
    } else {
      next.weekly_day = data.weekly_day
      next.day_of_month = data.day_of_month
      next.custom_interval_value = null
      next.custom_interval_unit = null
    }

    return next
  })
}

function handleCustomUnitChange(
  form: InertiaFormProps<NotificationFormData>,
  unit: CustomIntervalUnit,
  meta: MetaPayload,
) {
  form.setData((data: NotificationFormData) => ({
    ...data,
    custom_interval_unit: unit,
    weekly_day:
      unit === "weeks"
        ? data.weekly_day ?? meta.defaultWeeklyDay
        : data.weekly_day,
    day_of_month: unit === "months" ? data.day_of_month ?? 1 : data.day_of_month,
  }))
}

function handleLookbackChange(
  form: InertiaFormProps<NotificationFormData>,
  lookback: LookbackType,
) {
  form.setData((data: NotificationFormData) => ({
    ...data,
    lookback_type: lookback,
    lookback_days: lookback === "custom_days" ? data.lookback_days ?? 7 : null,
  }))
}

function FieldGroup({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return <div className={cn("flex flex-col gap-2", className)}>{children}</div>
}

function FormSection({
  title,
  description,
  children,
  className,
}: {
  title: string
  description?: string
  children: ReactNode
  className?: string
}) {
  return (
    <section
      className={cn(
        "space-y-4 rounded-lg border bg-card p-4 shadow-sm",
        className,
      )}
    >
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {description ? (
          <p className="text-xs text-muted-foreground">{description}</p>
        ) : null}
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  )
}
