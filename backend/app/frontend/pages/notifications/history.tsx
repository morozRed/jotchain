import { Head, usePage } from "@inertiajs/react"
import { useState } from "react"

import { DeliveryItem } from "@/components/notifications/delivery-item"
import NotificationsSubmenu from "@/components/notifications/notifications-submenu"
import { SummaryDialog } from "@/components/notifications/summary-dialog"
import { EmptyState } from "@/components/empty-state"
import { Card, CardContent } from "@/components/ui/card"
import { Pagination } from "@/components/ui/pagination"
import AppLayout from "@/layouts/app-layout"
import { notificationsPath } from "@/routes"
import type { BreadcrumbItem, SharedData } from "@/types"

interface DeliveryPayload {
  id: string
  status: string
  deliveredAt: string | null
  occurrenceAt: string
  windowStart: string
  windowEnd: string
  scheduleName: string
  summaryPayload: Record<string, unknown> | null
  errorMessage: string | null
  createdAt: string
  updatedAt: string
}

interface PaginationPayload {
  currentPage: number
  perPage: number
  totalCount: number
  totalPages: number
}

type PageProps = SharedData & {
  deliveries: DeliveryPayload[]
  pagination: PaginationPayload
}

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: "Notifications",
    href: notificationsPath(),
  },
]

export default function NotificationsHistory() {
  const { deliveries, pagination } = usePage<PageProps>().props
  const [selectedDelivery, setSelectedDelivery] = useState<DeliveryPayload | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleViewSummary = (delivery: DeliveryPayload) => {
    setSelectedDelivery(delivery)
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setSelectedDelivery(null)
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Notification History" />

      <NotificationsSubmenu>
        <div className="flex flex-1 flex-col gap-6">
          <header className="space-y-2">
            <h1 className="text-2xl font-semibold leading-tight text-foreground md:text-3xl">
              History
            </h1>
            <p className="max-w-2xl text-sm text-muted-foreground md:text-base">
              View past notification deliveries and their summaries.
            </p>
          </header>

          {deliveries.length === 0 ? (
            <Card className="border-dashed">
              <CardContent>
                <EmptyState
                  title="No delivery history"
                  description="Notification deliveries will appear here once they are sent."
                  className="border-0 bg-transparent p-0"
                />
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid gap-4">
                {deliveries.map((delivery) => (
                  <DeliveryItem
                    key={delivery.id}
                    {...delivery}
                    onViewSummary={() => handleViewSummary(delivery)}
                  />
                ))}
              </div>

              {pagination.totalCount > 0 && (
                <Pagination
                  currentPage={pagination.currentPage}
                  totalPages={pagination.totalPages}
                  totalCount={pagination.totalCount}
                  perPage={pagination.perPage}
                  baseUrl={`${notificationsPath()}/history`}
                  itemName="deliveries"
                />
              )}
            </>
          )}
        </div>
      </NotificationsSubmenu>

      {selectedDelivery && (
        <SummaryDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          summaryPayload={selectedDelivery.summaryPayload as any}
          errorMessage={selectedDelivery.errorMessage}
          windowStart={selectedDelivery.windowStart}
          windowEnd={selectedDelivery.windowEnd}
          scheduleName={selectedDelivery.scheduleName}
        />
      )}
    </AppLayout>
  )
}

