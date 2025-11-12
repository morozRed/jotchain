import { ChevronLeft, ChevronRight } from "lucide-react"
import { Link } from "@inertiajs/react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface PaginationProps {
  currentPage: number
  totalPages: number
  totalCount: number
  perPage: number
  baseUrl: string
  itemName?: string
}

export function Pagination({
  currentPage,
  totalPages,
  totalCount,
  perPage,
  baseUrl,
  itemName = "items",
}: PaginationProps) {
  const startItem = totalCount === 0 ? 0 : (currentPage - 1) * perPage + 1
  const endItem = Math.min(currentPage * perPage, totalCount)

  const getPageUrl = (page: number) => {
    const separator = baseUrl.includes("?") ? "&" : "?"
    return `${baseUrl}${separator}page=${page}`
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="text-sm text-muted-foreground">
        Showing {startItem}-{endItem} of {totalCount} {itemName}
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          asChild
          disabled={currentPage === 1}
          className={cn({ "pointer-events-none opacity-50": currentPage === 1 })}
        >
          <Link href={currentPage > 1 ? getPageUrl(currentPage - 1) : "#"} prefetch>
            <ChevronLeft className="size-4" />
            Previous
          </Link>
        </Button>

        <div className="flex items-center gap-1">
          {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
            let pageNum: number
            if (totalPages <= 7) {
              pageNum = i + 1
            } else if (currentPage <= 4) {
              pageNum = i + 1
            } else if (currentPage >= totalPages - 3) {
              pageNum = totalPages - 6 + i
            } else {
              pageNum = currentPage - 3 + i
            }

            return (
              <Button
                key={pageNum}
                variant={currentPage === pageNum ? "default" : "outline"}
                size="sm"
                asChild
                className={cn("min-w-[2.5rem]", {
                  "pointer-events-none": currentPage === pageNum,
                })}
              >
                <Link href={getPageUrl(pageNum)} prefetch>
                  {pageNum}
                </Link>
              </Button>
            )
          })}
        </div>

        <Button
          variant="outline"
          size="sm"
          asChild
          disabled={currentPage === totalPages}
          className={cn({ "pointer-events-none opacity-50": currentPage === totalPages })}
        >
          <Link href={currentPage < totalPages ? getPageUrl(currentPage + 1) : "#"} prefetch>
            Next
            <ChevronRight className="size-4" />
          </Link>
        </Button>
      </div>
    </div>
  )
}

