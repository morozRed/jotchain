import { Head, Link, useForm, usePage } from "@inertiajs/react"
import { Plus, Sparkles } from "lucide-react"
import { useCallback, useEffect, useMemo, useState } from "react"

import { EmptyState } from "@/components/empty-state"
import { NotificationCard } from "@/components/notifications/notification-card"
import { NotificationFormSections } from "@/components/notifications/notification-form-sections"
import NotificationsSubmenu from "@/components/notifications/notifications-submenu"
import type {
  MetaPayload,
  NotificationFormData,
  NotificationSchedulePayload,
} from "@/components/notifications/types"
import {
  buildDefaultFormData,
  computePreviewOccurrences,
  normalizePayload,
} from "@/components/notifications/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import AppLayout from "@/layouts/app-layout"
import { billingPath, notificationsPath } from "@/routes"
import type { BreadcrumbItem, SharedData } from "@/types"

type PageProps = SharedData & {
  notificationSchedules: NotificationSchedulePayload[]
  notificationScheduleMeta: MetaPayload
}

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: "Notifications",
    href: notificationsPath(),
  },
]

export default function Notifications() {
  const { notificationSchedules, notificationScheduleMeta, auth } =
    usePage<PageProps>().props

  const [isCreateOpen, setIsCreateOpen] = useState(false)

  const defaultCreateData = useMemo(
    () => buildDefaultFormData(notificationScheduleMeta),
    [notificationScheduleMeta],
  )

  const createForm = useForm<NotificationFormData>(() => defaultCreateData)

  useEffect(() => {
    createForm.reset(defaultCreateData)
    createForm.clearErrors()
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

      <NotificationsSubmenu>
        <div className="flex flex-1 flex-col gap-6">
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

          {auth.user?.subscription?.status !== "active" && (
            <Card className="border-cyan-500/30 bg-cyan-50 dark:bg-cyan-950/20 shadow-sm">
              <CardContent className="py-4">
                <div className="flex items-center gap-3">
                  <Sparkles className="h-5 w-5 text-cyan-600 dark:text-cyan-400 flex-shrink-0" />
                  <div className="flex-1 flex items-center justify-between gap-4">
                    <span className="text-sm text-cyan-900 dark:text-cyan-100">
                      {auth.user?.subscription?.daysLeftInTrial > 0
                        ? `You have ${auth.user.subscription.daysLeftInTrial} ${auth.user.subscription.daysLeftInTrial === 1 ? "day" : "days"} left in your trial. Subscribe to continue receiving notifications.`
                        : "Subscribe to Pro to receive email notifications and AI-powered summaries."}
                    </span>
                    <Button asChild size="sm" variant="outline" className="shrink-0">
                      <Link href={billingPath()}>Upgrade Now</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid w-full max-w-8xl gap-6 self-center">
            {notificationSchedules.map((schedule) => (
              <NotificationCard
                key={schedule.id}
                schedule={schedule}
                meta={notificationScheduleMeta}
              />
            ))}

            {notificationSchedules.length === 0 ? (
              <Card className="border-dashed">
                <CardContent>
                  <EmptyState
                    title="No notifications yet"
                    description="Start by creating a notification. We&apos;ll prefill smart defaults so you can fine-tune every detail."
                    action={
                      <Button onClick={openCreateDialog}>
                        <Plus className="size-4" />
                        Create your first notification
                      </Button>
                    }
                    className="border-0 bg-transparent p-0"
                  />
                </CardContent>
              </Card>
            ) : null}
          </div>
        </div>
      </NotificationsSubmenu>

      <Dialog open={isCreateOpen} onOpenChange={(open) => (open ? setIsCreateOpen(true) : closeCreateDialog())}>
        <DialogContent className="max-w-3xl lg:max-w-5xl">
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
