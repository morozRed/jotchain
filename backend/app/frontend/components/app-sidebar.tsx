import { Link, usePage } from "@inertiajs/react"
import { CreditCard, LayoutGrid } from "lucide-react"

import { FeedbackButton } from "@/components/feedback-button"
import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { SubscriptionStatus } from "@/components/subscription-status"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { billingPath, dashboardPath } from "@/routes"
import type { NavItem, SharedData } from "@/types"

import AppLogo from "./app-logo"

const mainNavItems: NavItem[] = [
  {
    title: "Log",
    href: dashboardPath(),
    icon: LayoutGrid,
  },
  {
    title: "Billing",
    href: billingPath(),
    icon: CreditCard,
  },
]

export function AppSidebar() {
  const { auth } = usePage<SharedData>().props
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href={dashboardPath()} prefetch>
                <AppLogo />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={mainNavItems} />
      </SidebarContent>

      <SidebarFooter>
        {!isCollapsed ? <SubscriptionStatus user={auth.user} /> : null}
        <FeedbackButton />
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
