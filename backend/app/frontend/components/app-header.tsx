import { Link, usePage } from "@inertiajs/react"
import { Command, CreditCard, LayoutGrid, LogOut, Settings, Sparkles } from "lucide-react"

import AppLogoIcon from "@/components/app-logo-icon"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { billingPath } from "@/routes"
import type { SharedData } from "@/types"

const navItems = [
  { title: "Log", href: "/log", icon: LayoutGrid },
  { title: "Billing", href: billingPath(), icon: CreditCard },
]

interface AppHeaderProps {
  onCommandOpen?: () => void
}

// Get plan display info
function getPlanInfo(user: SharedData["auth"]["user"]) {
  const subscription = (user as { subscription?: {
    status: string
    daysLeftInTrial?: number
    planType?: string | null
  } }).subscription

  if (!subscription) {
    return { label: "Free", variant: "default" as const }
  }

  // Active paid subscription
  if (subscription.status === "active" && subscription.planType) {
    return { label: "Pro", variant: "pro" as const }
  }

  // Trial active
  if (
    subscription.status === "trialing" &&
    subscription.daysLeftInTrial != null &&
    subscription.daysLeftInTrial > 0
  ) {
    if (subscription.planType) {
      return {
        label: `Pro trial`,
        sublabel: `${subscription.daysLeftInTrial}d`,
        variant: "trial" as const
      }
    }
    return {
      label: "Trial",
      sublabel: `${subscription.daysLeftInTrial}d`,
      variant: "trial" as const
    }
  }

  return { label: "Free", variant: "default" as const }
}

export function AppHeader({ onCommandOpen }: AppHeaderProps) {
  const page = usePage<SharedData>()
  const { auth } = page.props
  const user = auth.user
  const planInfo = getPlanInfo(user)

  // Check if current path matches nav item
  const isActive = (href: string) => {
    const currentPath = page.url.split("?")[0]
    if (href === "/log") {
      return currentPath === "/log"
    }
    return currentPath.startsWith(href)
  }

  return (
    <header className="sticky top-0 z-40 flex h-12 shrink-0 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur-sm">
      {/* Left: Logo + Nav */}
      <div className="flex items-center gap-6">
        <Link href="/" className="flex items-center gap-2">
          <AppLogoIcon className="size-6" />
          <span className="text-[13px] font-semibold tracking-tight text-foreground">
            jotchain
          </span>
        </Link>

        {/* Navigation */}
        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-md px-3 py-1.5 text-[13px] transition-colors",
                isActive(item.href)
                  ? "bg-subtle font-medium text-foreground"
                  : "text-muted-foreground hover:bg-subtle hover:text-foreground"
              )}
            >
              {item.title}
            </Link>
          ))}
        </nav>
      </div>

      {/* Right: Plan Badge + Command + Avatar */}
      <div className="flex items-center gap-3">
        {/* Plan badge */}
        <Link
          href={billingPath()}
          className={cn(
            "hidden items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-medium transition-colors sm:flex",
            planInfo.variant === "pro" && "bg-gradient-to-r from-violet-500/10 to-indigo-500/10 text-violet-600 hover:from-violet-500/20 hover:to-indigo-500/20",
            planInfo.variant === "trial" && "bg-amber-500/10 text-amber-600 hover:bg-amber-500/15",
            planInfo.variant === "default" && "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
          )}
        >
          {planInfo.variant === "pro" && <Sparkles className="size-3" />}
          <span>{planInfo.label}</span>
          {planInfo.sublabel && (
            <span className="opacity-60">{planInfo.sublabel}</span>
          )}
        </Link>

        {/* Command palette trigger */}
        {onCommandOpen && (
          <button
            className="hidden items-center gap-1.5 rounded-md border border-border bg-subtle/50 px-2 py-1 text-[11px] text-muted-foreground transition-colors hover:bg-subtle hover:text-foreground sm:flex"
            onClick={onCommandOpen}
          >
            <Command className="size-3" />
            <span>K</span>
          </button>
        )}

        {/* User dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center rounded-full transition-opacity hover:opacity-80">
              <Avatar className="size-7">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="bg-primary/10 text-[11px] font-medium text-primary">
                  {user.name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/settings/profile">
                <Settings className="mr-2 size-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/sessions" method="delete" as="button" className="w-full">
                <LogOut className="mr-2 size-4" />
                Sign out
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
