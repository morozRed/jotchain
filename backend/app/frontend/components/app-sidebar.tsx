import { Link, usePage } from "@inertiajs/react"
import { BarChart3, Bell, CreditCard, LayoutGrid } from "lucide-react"

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
} from "@/components/ui/sidebar"
import { billingPath, dashboardPath, insightsPath, notificationsPath } from "@/routes"
import type { NavItem, SharedData } from "@/types"

import AppLogo from "./app-logo"

const mainNavItems: NavItem[] = [
  {
    title: "Dashboard",
    href: dashboardPath(),
    icon: LayoutGrid,
  },
  {
    title: "Insights",
    href: insightsPath(),
    icon: BarChart3,
  },
  {
    title: "Notifications",
    href: notificationsPath(),
    icon: Bell,
  },
  {
    title: "Billing",
    href: billingPath(),
    icon: CreditCard,
  },
]

export function AppSidebar() {
  const { auth } = usePage<SharedData>().props

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
        <SubscriptionStatus user={auth.user} />
        <FeedbackButton />
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
