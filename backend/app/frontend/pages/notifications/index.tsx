import { Head, Link, useForm, usePage } from "@inertiajs/react"
import { Plus, Sparkles } from "lucide-react"
import { useCallback, useEffect, useMemo, useState } from "react"

import { NotificationCard } from "@/components/notifications/notification-card"
import { NotificationFormSections } from "@/components/notifications/notification-form-sections"
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
import { PageBody } from "@/components/page/page-body"
import { Button } from "@/components/ui/button"
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
    title: "Email digests",
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
      <Head title="Email digests" />

      <PageBody>
        {/* Page header - calm and clear */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              Email digests
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Summaries of your work, sent when you need them.
            </p>
          </div>

          <Button onClick={openCreateDialog} variant="secondary" className="self-start">
            <Plus className="size-4" />
            New digest
          </Button>
        </header>

        {/* Digests list */}
        {notificationSchedules.length > 0 ? (
          <section className="divide-y divide-border-subtle">
            {notificationSchedules.map((schedule) => (
              <NotificationCard
                key={schedule.id}
                schedule={schedule}
                meta={notificationScheduleMeta}
              />
            ))}
          </section>
        ) : (
          <section className="py-8 text-center">
            <p className="text-muted-foreground mb-4">
              No digests yet. Create one to receive summaries of your work.
            </p>
            <Button onClick={openCreateDialog}>
              <Plus className="size-4" />
              Create your first digest
            </Button>
          </section>
        )}

        {/* Trial/subscription banner - moved below list */}
        {auth.user?.subscription?.status !== "active" && (
          <div className="flex flex-col gap-4 rounded-lg border border-primary/20 bg-primary-soft-bg p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 flex-shrink-0 text-primary mt-0.5" />
              <span className="text-sm text-foreground">
                {auth.user?.subscription?.daysLeftInTrial > 0
                  ? `${auth.user.subscription.daysLeftInTrial} ${auth.user.subscription.daysLeftInTrial === 1 ? "day" : "days"} left in your trial.`
                  : "Subscribe to continue receiving email digests."}
              </span>
            </div>
            <Button asChild size="sm" variant="secondary" className="shrink-0">
              <Link href={billingPath()}>Upgrade</Link>
            </Button>
          </div>
        )}
      </PageBody>

      <Dialog open={isCreateOpen} onOpenChange={(open) => (open ? setIsCreateOpen(true) : closeCreateDialog())}>
        <DialogContent className="max-w-3xl lg:max-w-5xl">
          <DialogHeader>
            <DialogTitle>Create digest</DialogTitle>
            <DialogDescription>
              Choose when to receive summaries and what period to cover.
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
                variant="secondary"
                onClick={closeCreateDialog}
                disabled={createForm.processing}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createForm.processing}>
                {createForm.processing ? "Creating..." : "Create digest"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AppLayout>
  )
}
