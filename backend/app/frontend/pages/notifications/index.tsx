import {
  Head,
  router,
  useForm,
  usePage,
  type InertiaFormProps,
} from "@inertiajs/react"
import { MoreVertical, Plus } from "lucide-react"
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"

import InputError from "@/components/input-error"
import AppLayout from "@/layouts/app-layout"
import type { BreadcrumbItem, SharedData } from "@/types"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { cn } from "@/lib/utils"
import { notificationPath, notificationsPath } from "@/routes"

type Recurrence = "daily_weekdays" | "weekly" | "monthly_dom" | "custom"
type CustomIntervalUnit = "days" | "weeks" | "months"
type LookbackType = "day" | "week" | "month" | "half_year" | "year" | "custom_days"

type NotificationSchedulePayload = {
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

type MetaPayload = {
  timezone: string
  timezonePresets: string[]
  weekdayOptions: { value: number; label: string }[]
  recurrenceOptions: Recurrence[]
  customIntervalUnitOptions: CustomIntervalUnit[]
  lookbackPresets: Exclude<LookbackType, "custom_days">[]
  defaultWeeklyDay: number
}

type PageProps = SharedData & {
  notificationSchedules: NotificationSchedulePayload[]
  notificationScheduleMeta: MetaPayload
}

type NotificationFormData = {
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

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: "Notifications",
    href: notificationsPath(),
  },
]

const RECURRENCE_LABELS: Record<Recurrence, string> = {
  daily_weekdays: "Every weekday",
  weekly: "Weekly",
  monthly_dom: "Monthly on specific day",
  custom: "Custom cadence",
}

const LOOKBACK_LABELS: Record<LookbackType, string> = {
  day: "Last day",
  week: "Last week",
  month: "Last month",
  half_year: "Last half-year",
  year: "Last year",
  custom_days: "Custom (days)",
}

const UNIT_LABELS: Record<CustomIntervalUnit, string> = {
  days: "Days",
  weeks: "Weeks",
  months: "Months",
}

const WEEKDAY_INDEX: Record<string, number> = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
}

export default function Notifications() {
  const { notificationSchedules, notificationScheduleMeta } =
    usePage<PageProps>().props

  const [isCreateOpen, setIsCreateOpen] = useState(false)

  const defaultCreateData = useMemo(
    () => buildDefaultFormData(notificationScheduleMeta),
    [notificationScheduleMeta],
  )

  const createForm = useForm<NotificationFormData>(() => defaultCreateData)

  useEffect(() => {
    createForm.setData(defaultCreateData)
    createForm.clearErrors()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultCreateData])

  const openCreateDialog = useCallback(() => {
    createForm.setData(defaultCreateData)
    createForm.clearErrors()
    setIsCreateOpen(true)
  }, [createForm, defaultCreateData])

  const closeCreateDialog = useCallback(() => {
    setIsCreateOpen(false)
    createForm.reset()
    createForm.clearErrors()
    createForm.setData(defaultCreateData)
  }, [createForm, defaultCreateData])

  const createOccurrences = useMemo(
    () => computePreviewOccurrences(createForm.data),
    [createForm.data],
  )

  const handleCreateSubmit: React.FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault()

    createForm.transform((data) => ({
      notification_schedule: normalizePayload(data),
    }))

    createForm.post(notificationsPath(), {
      preserveScroll: true,
      onSuccess: () => {
        closeCreateDialog()
      },
      onFinish: () => {
        createForm.transform((data) => data)
      },
    })
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Notifications" />

      <div className="flex flex-1 flex-col gap-6 px-4 pb-10 pt-6 md:px-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold leading-tight text-foreground md:text-3xl">
              Notifications
            </h1>
            <p className="max-w-2xl text-sm text-muted-foreground md:text-base">
              Configure automated email summaries with flexible cadences, lookback windows, and lead times.
            </p>
          </div>

          <Button onClick={openCreateDialog} className="self-start">
            <Plus className="size-4" />
            New notification
          </Button>
        </header>

        <div className="grid w-full max-w-8xl gap-6 self-center">
          {notificationSchedules.map((schedule) => (
            <NotificationCard
              key={schedule.id}
              schedule={schedule}
              meta={notificationScheduleMeta}
            />
          ))}

          {notificationSchedules.length === 0 && (
            <Card className="border-dashed">
              <CardHeader>
                <CardTitle className="text-lg">No notifications yet</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>
                  Start by creating a notification. We&rsquo;ll prefill smart defaults so you can fine-tune every detail.
                </p>
              </CardContent>
              <CardFooter>
                <Button onClick={openCreateDialog}>
                  <Plus className="size-4" />
                  Create your first notification
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>
      </div>

      <Dialog open={isCreateOpen} onOpenChange={(open) => (open ? setIsCreateOpen(true) : closeCreateDialog())}>
        <DialogContent className="max-w-2xl lg:max-w-4xl">
          <DialogHeader>
            <DialogTitle>Create notification</DialogTitle>
            <DialogDescription>
              Choose delivery settings, cadence, and summary window. You can always adjust these later.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateSubmit} className="space-y-6">
            <NotificationFormSections
              form={createForm}
              meta={notificationScheduleMeta}
              idPrefix="notification-new"
              processing={createForm.processing}
              occurrences={createOccurrences}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={closeCreateDialog}
                disabled={createForm.processing}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createForm.processing}>
                {createForm.processing ? "Creating..." : "Create notification"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AppLayout>
  )
}

function NotificationCard({
  schedule,
  meta,
}: {
  schedule: NotificationSchedulePayload
  meta: MetaPayload
}) {
  const form = useForm<NotificationFormData>({
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
  })

  useEffect(() => {
    form.setData(() => ({
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
    }))
    form.clearErrors()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schedule, meta.defaultWeeklyDay])

  const [isEditOpen, setIsEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const previewOccurrences = useMemo(() => {
    try {
      return computePreviewOccurrences(form.data)
    } catch (error) {
      console.error(error)
      return []
    }
  }, [form.data])

  const serverOccurrences = schedule.nextOccurrences.map((iso) =>
    formatInTimeZone(iso, form.data.timezone),
  )

  const occurrences = previewOccurrences.length
    ? previewOccurrences
    : serverOccurrences

  const idPrefix = `notification-${schedule.id}`

  const onSubmit: React.FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault()

    form.transform((data) => ({
      notification_schedule: normalizePayload(data),
    }))

    form.put(notificationPath(schedule.id), {
      preserveScroll: true,
      onFinish: () => {
        form.transform((data) => data)
      },
    })
  }

  const confirmDelete = useCallback(() => {
    router.delete(notificationPath(schedule.id), {
      preserveScroll: true,
      onSuccess: () => setDeleteOpen(false),
    })
  }, [schedule.id])

  const cadenceLabel = (() => {
    if (form.data.recurrence === "daily_weekdays") {
      return "Every weekday"
    }
    if (form.data.recurrence === "weekly") {
      const weekday = lookupWeekday(form.data.weekly_day)
      return `Weekly on ${weekday}`
    }
    if (form.data.recurrence === "monthly_dom") {
      return `Monthly on day ${form.data.day_of_month ?? 1}`
    }
    if (form.data.recurrence === "custom") {
      const value = form.data.custom_interval_value ?? 1
      const unit = UNIT_LABELS[form.data.custom_interval_unit ?? "weeks"].toLowerCase()
      if (form.data.custom_interval_unit === "weeks") {
        const weekday = lookupWeekday(form.data.weekly_day)
        return `Every ${value} ${unit} on ${weekday}`
      }
      if (form.data.custom_interval_unit === "months") {
        return `Every ${value} ${unit} on day ${form.data.day_of_month ?? 1}`
      }
      return `Every ${value} ${unit}`
    }
    return "Custom cadence"
  })()

  const lookbackLabel = (() => {
    if (form.data.lookback_type === "custom_days") {
      return `Last ${form.data.lookback_days ?? 7} days`
    }
    return LOOKBACK_LABELS[form.data.lookback_type]
  })()

  return (
    <Card className="border shadow-sm">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg font-semibold">
              {schedule.name || buildSuggestedName(form.data)}
            </CardTitle>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-xs font-medium",
                schedule.enabled
                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                  : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
              )}
            >
              {schedule.enabled ? "Enabled" : "Paused"}
            </span>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="size-8 p-0">
              <MoreVertical className="size-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setDeleteOpen(true)}
              className="text-destructive"
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-lg border bg-muted/40 p-3 text-sm">
            <div>
              <h4 className="mb-2 text-sm font-semibold text-foreground">Delivery</h4>
              <dl className="space-y-2 text-sm">
                <div>
                  <dt className="inline font-medium text-muted-foreground">Time zone: </dt>
                  <dd className="inline">{form.data.timezone}</dd>
                </div>
                <div>
                  <dt className="inline font-medium text-muted-foreground">Send time: </dt>
                  <dd className="inline">{form.data.time_of_day}</dd>
                </div>
                <div>
                  <dt className="inline font-medium text-muted-foreground">Lead time: </dt>
                  <dd className="inline">{form.data.lead_time_minutes} minutes</dd>
                </div>
              </dl>
            </div>
          </div>

          <div className="rounded-lg border bg-muted/40 p-3 text-sm">
            <div>
              <h4 className="mb-2 text-sm font-semibold text-foreground">Schedule</h4>
              <dl className="space-y-2 text-sm">
                <div>
                  <dt className="inline font-medium text-muted-foreground">Cadence: </dt>
                  <dd className="inline">{cadenceLabel}</dd>
                </div>
                <div>
                  <dt className="inline font-medium text-muted-foreground">Summary: </dt>
                  <dd className="inline">{lookbackLabel}</dd>
                </div>
              </dl>
            </div>
          </div>
          <div className="rounded-lg border bg-muted/40 p-3 text-sm">
            <p className="font-medium text-foreground">Next deliveries</p>
            {occurrences.length ? (
              <ul className="mt-1.5 space-y-1 text-muted-foreground">
                {occurrences.map((occurrence, index) => (
                  <li key={`${occurrence}-${index}`} className="leading-relaxed">
                    {occurrence}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-1 text-muted-foreground">
                No upcoming deliveries scheduled.
              </p>
            )}
          </div>
        </div>
      </CardContent>

      <Dialog open={isEditOpen} onOpenChange={(open) => (open ? setIsEditOpen(true) : setIsEditOpen(false))}>
        <DialogContent className="max-w-2xl lg:max-w-4xl">
          <DialogHeader>
            <DialogTitle>Edit notification</DialogTitle>
            <DialogDescription>
              Update delivery settings, cadence, and summary window.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={onSubmit} className="space-y-6">
            <NotificationFormSections
              form={form}
              meta={meta}
              idPrefix={idPrefix}
              processing={form.processing}
              occurrences={occurrences}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditOpen(false)}
                disabled={form.processing}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={form.processing}>
                {form.processing ? "Saving..." : "Save changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete notification?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. We&rsquo;ll stop sending summaries tied to this notification immediately.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

function NotificationFormSections({
  form,
  meta,
  idPrefix,
  processing,
  occurrences,
}: {
  form: InertiaFormProps<NotificationFormData>
  meta: MetaPayload
  idPrefix: string
  processing: boolean
  occurrences: string[]
}) {
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
    <div className="space-y-6 lg:grid lg:grid-cols-2 lg:gap-8 lg:space-y-0">
      <div className="space-y-6">
        <FormSection
          title="Basics"
          description="Give the notification a readable name and control whether it is active."
        >
          <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-start">
            <FieldGroup>
              <Label htmlFor={`${idPrefix}-name`}>Name</Label>
              <Input
                id={`${idPrefix}-name`}
                value={form.data.name}
                onChange={(event) => form.setData("name", event.target.value)}
                aria-invalid={Boolean(form.errors.name)}
                placeholder={buildSuggestedName(form.data)}
                disabled={processing}
              />
              <InputError message={form.errors.name} />
            </FieldGroup>

            <div className="flex flex-col gap-2">
              <Label>Status</Label>
              <div className="flex h-8 items-center gap-2 text-sm text-muted-foreground">
                <Checkbox
                  id={`${idPrefix}-enabled`}
                  checked={form.data.enabled}
                  onCheckedChange={(checked) =>
                    form.setData("enabled", Boolean(checked))
                  }
                  disabled={processing}
                />
                <Label htmlFor={`${idPrefix}-enabled`} className="text-sm">
                  {form.data.enabled ? "Enabled" : "Paused"}
                </Label>
              </div>
            </div>
          </div>
        </FormSection>

        <Separator className="md:hidden" />

        <FormSection
          title="Delivery"
          description="Choose when emails send and how much lead time to include."
        >
          <div className="grid gap-4 md:grid-cols-1">
            <FieldGroup>
              <Label htmlFor={`${idPrefix}-timezone`}>Time zone</Label>
              <Select
                value={form.data.timezone}
                onValueChange={(value) => form.setData("timezone", value)}
                disabled={processing}
              >
                <SelectTrigger id={`${idPrefix}-timezone`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[form.data.timezone, ...meta.timezonePresets]
                    .filter((value, index, array) => array.indexOf(value) === index)
                    .map((value) => (
                      <SelectItem key={value} value={value}>
                        {value}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <InputError message={form.errors.timezone} />
            </FieldGroup>

            <FieldGroup>
              <Label htmlFor={`${idPrefix}-time`}>Send time</Label>
              <Input
                id={`${idPrefix}-time`}
                type="time"
                value={form.data.time_of_day}
                onChange={(event) => form.setData("time_of_day", event.target.value)}
                disabled={processing}
                aria-invalid={Boolean(form.errors.time_of_day)}
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
      </div>

      <div className="space-y-6">
        <FormSection
          title="Cadence"
          description="Set how often the notification fires."
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

          {showWeeklyDay && (
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
          )}

          {showDayOfMonth && (
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
          )}

          {form.data.recurrence === "custom" && (
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
          )}
        </div>
        </FormSection>

        <Separator className="md:hidden" />

        <FormSection
          title="Summary window"
          description="Decide how much history each email covers and preview upcoming sends."
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

          {form.data.lookback_type === "custom_days" && (
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
          )}
        </div>

        <div className="rounded-lg border bg-muted/40 p-3 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">Next deliveries</p>
          {occurrences.length ? (
            <ul className="mt-1.5 space-y-1">
              {occurrences.map((occurrence, index) => (
                <li key={`${occurrence}-${index}`} className="leading-relaxed">
                  {occurrence}
                </li>
              ))}
            </ul>
          ) : (
              <p className="mt-1">
                Configure cadence and timing to preview upcoming sends.
              </p>
            )}
          </div>
        </FormSection>
      </div>
    </div>
  )
}

function FieldGroup({ children, className }: { children: ReactNode; className?: string }) {
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
    <section className={cn("space-y-4", className)}>
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

function buildDefaultFormData(meta: MetaPayload): NotificationFormData {
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

function buildSuggestedName(
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

function lookupWeekday(index: number | null | undefined): string {
  const fallback = "Monday"
  if (index == null) return fallback

  const entry = Object.entries(WEEKDAY_INDEX).find(([, value]) => value === index)
  return entry ? entry[0] : fallback
}

function normalizePayload(data: NotificationFormData): NotificationFormData {
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

function formatInTimeZone(isoString: string, timeZone: string): string {
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

type ZonedParts = {
  year: number
  month: number
  day: number
  hour: number
  minute: number
  second: number
  weekday: number
}

type TimeOfDayParts = {
  hour: number
  minute: number
}

function computePreviewOccurrences(
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

function isWeekend(date: Date, timeZone: string): boolean {
  const weekday = getZonedParts(date, timeZone).weekday
  return weekday === 0 || weekday === 6
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
