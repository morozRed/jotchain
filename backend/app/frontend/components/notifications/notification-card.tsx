import { router, useForm } from "@inertiajs/react"
import { MoreVertical } from "lucide-react"
import { useCallback, useEffect, useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { cn } from "@/lib/utils"
import { notificationPath } from "@/routes"

import { LOOKBACK_LABELS, UNIT_LABELS } from "./constants"
import { NotificationFormSections } from "./notification-form-sections"
import type {
  MetaPayload,
  NotificationFormData,
  NotificationSchedulePayload,
} from "./types"
import {
  buildSuggestedName,
  computePreviewOccurrences,
  formDataFromSchedule,
  formatInTimeZone,
  isNotificationFormDataEqual,
  lookupWeekday,
  normalizePayload,
} from "./utils"

interface NotificationCardProps {
  schedule: NotificationSchedulePayload
  meta: MetaPayload
}

export function NotificationCard({ schedule, meta }: NotificationCardProps) {
  const initialData = useMemo(
    () => formDataFromSchedule(schedule, meta),
    [schedule, meta],
  )

  const form = useForm<NotificationFormData>(() => initialData)

  useEffect(() => {
    if (!isNotificationFormDataEqual(form.data, initialData)) {
      form.reset(initialData)
      form.clearErrors()
    }
  }, [form, initialData])

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
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete notification?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the notification schedule.
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
