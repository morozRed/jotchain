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
import { Switch } from "@/components/ui/switch"
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
  const { setData, setDefaults, clearErrors } = form

  useEffect(() => {
    setData(initialData)
    setDefaults(initialData)
    clearErrors()
  }, [initialData, setData, setDefaults, clearErrors])

  const [isEditOpen, setIsEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [optimisticEnabled, setOptimisticEnabled] = useState<boolean | null>(null)

  // Use optimistic state if available, otherwise use server state
  const currentEnabled = optimisticEnabled ?? schedule.enabled

  // Reset optimistic state when schedule prop updates
  useEffect(() => {
    setOptimisticEnabled(null)
  }, [schedule.enabled])

  const {
    timezone,
    time_of_day,
    recurrence,
    weekly_day,
    day_of_month,
    custom_interval_unit,
    custom_interval_value,
  } = form.data

  const previewOccurrences = useMemo(() => {
    try {
      return computePreviewOccurrences(form.data)
    } catch (error) {
      console.error(error)
      return []
    }
  }, [
    timezone,
    time_of_day,
    recurrence,
    weekly_day,
    day_of_month,
    custom_interval_unit,
    custom_interval_value,
  ])

  const serverOccurrences = useMemo(
    () =>
      schedule.nextOccurrences.map((iso) => formatInTimeZone(iso, timezone)),
    [schedule.nextOccurrences, timezone],
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

  const handleToggleEnabled = useCallback(
    (checked: boolean) => {
      // Optimistically update the UI
      setOptimisticEnabled(checked)

      router.put(
        notificationPath(schedule.id),
        {
          notification_schedule: {
            enabled: checked,
          },
        },
        {
          preserveScroll: true,
          onError: () => {
            // Revert optimistic update on error
            setOptimisticEnabled(null)
          },
        },
      )
    },
    [schedule.id],
  )

  const cadenceLabel = (() => {
    if (recurrence === "daily_weekdays") {
      return "Every weekday"
    }
    if (recurrence === "weekly") {
      const weekday = lookupWeekday(weekly_day)
      return `Weekly on ${weekday}`
    }
    if (recurrence === "monthly_dom") {
      return `Monthly on day ${day_of_month ?? 1}`
    }
    if (recurrence === "custom") {
      const value = custom_interval_value ?? 1
      const unit = UNIT_LABELS[custom_interval_unit ?? "weeks"].toLowerCase()
      if (custom_interval_unit === "weeks") {
        const weekday = lookupWeekday(weekly_day)
        return `Every ${value} ${unit} on ${weekday}`
      }
      if (custom_interval_unit === "months") {
        return `Every ${value} ${unit} on day ${day_of_month ?? 1}`
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
    <Card className="border shadow-sm gap-1">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-lg font-semibold">
          {schedule.name || buildSuggestedName(form.data)}
        </CardTitle>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Switch
              id={`notification-toggle-${schedule.id}`}
              checked={currentEnabled}
              onCheckedChange={handleToggleEnabled}
            />
            <label
              htmlFor={`notification-toggle-${schedule.id}`}
              className="text-sm font-medium text-muted-foreground cursor-pointer"
            >
              {currentEnabled ? "Enabled" : "Disabled"}
            </label>
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
        </div>
      </CardHeader>

      <CardContent className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
        <div className="flex items-center gap-1.5">
          <span className="text-muted-foreground">{cadenceLabel}</span>
          <span className="text-muted-foreground">@</span>
          <span className="font-medium">{time_of_day}</span>
        </div>
        <div className="h-4 w-px bg-border" />
        <div className="text-muted-foreground">{lookbackLabel}</div>
        {occurrences.length > 0 && (
          <>
            <div className="h-4 w-px bg-border" />
            <div className="flex items-center gap-1.5">
              <span className="text-sm text-muted-foreground">Next:</span>
              <span>{occurrences[0]}</span>
            </div>
          </>
        )}
      </CardContent>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
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
