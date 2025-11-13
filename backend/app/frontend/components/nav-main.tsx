import { Link, usePage } from "@inertiajs/react"
import { ChevronDown } from "lucide-react"
import { useCallback, useState } from "react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import type { NavItem } from "@/types"

export function NavMain({ items = [] }: { items: NavItem[] }) {
  const { url } = usePage()
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({})

  const matchesPath = useCallback(
    (path: string, { exact = false }: { exact?: boolean } = {}) => {
      if (!path) return false
      const normalized =
        path.length > 1 && path.endsWith("/") ? path.slice(0, -1) : path
      const current = url.split("#")[0]
      const exactMatch =
        current === normalized || current.startsWith(`${normalized}?`)

      if (exact) {
        return exactMatch
      }

      return exactMatch || current.startsWith(`${normalized}/`)
    },
    [url],
  )

  const handleOpenChange = useCallback((href: string, nextOpen: boolean) => {
    setOpenItems((prev) => ({
      ...prev,
      [href]: nextOpen,
    }))
  }, [])

  return (
    <SidebarGroup className="px-2 py-0">
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const Icon = item.icon
          const childItems = item.items ?? []
          const hasChildren = childItems.length > 0
          const childIsActive = hasChildren
            ? childItems.some((child) => matchesPath(child.href, { exact: true }))
            : false
          const isActive = matchesPath(item.href) || childIsActive
          const isOpen =
            matchesPath(item.href) || childIsActive || Boolean(openItems[item.href])

          return (
            <SidebarMenuItem key={item.title}>
              {hasChildren ? (
                <Collapsible
                  open={isOpen}
                  onOpenChange={(nextOpen) => handleOpenChange(item.href, nextOpen)}
                  className="group/collapsible"
                >
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      isActive={isActive}
                      tooltip={{ children: item.title }}
                      className="justify-between [&>svg:last-child]:transition-transform [&>svg:last-child]:duration-200 data-[state=open]:[&>svg:last-child]:rotate-180"
                    >
                      <span className="flex items-center gap-2">
                        {Icon && <Icon className="size-4" />}
                        <span>{item.title}</span>
                      </span>
                      <ChevronDown className="size-4 text-muted-foreground" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>

                  <CollapsibleContent className="space-y-1 overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                    <SidebarMenuSub>
                      {childItems.map((child) => (
                        <SidebarMenuSubItem key={child.href}>
                          <SidebarMenuSubButton
                            asChild
                            isActive={matchesPath(child.href, { exact: true })}
                          >
                            <Link href={child.href} prefetch>
                              <span>{child.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </Collapsible>
              ) : (
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  tooltip={{ children: item.title }}
                >
                  <Link href={item.href} prefetch>
                    {Icon && <Icon className="size-4" />}
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              )}
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
