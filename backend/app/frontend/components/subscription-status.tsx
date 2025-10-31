import { Link } from "@inertiajs/react"
import { Clock, CreditCard, Sparkles } from "lucide-react"

import { billingPath } from "@/routes"
import type { SharedData } from "@/types"

type SubscriptionStatusProps = {
  user: SharedData["auth"]["user"]
}

export function SubscriptionStatus({ user }: SubscriptionStatusProps) {
  if (!user) return null

  const subscription = user.subscription || {
    status: "trialing",
    daysLeftInTrial: 14,
    planType: null,
  }

  // Active paid subscription
  if (subscription.status === "active" && subscription.planType) {
    const planName = subscription.planType === "monthly" ? "Monthly Pro" : "Yearly Pro"
    return (
      <Link
        href={billingPath()}
        className="flex items-center gap-3 rounded-lg border border-border/50 bg-muted/30 p-3 transition-colors hover:bg-muted/50"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-cyan-500 to-indigo-500">
          <Sparkles className="h-4 w-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{planName}</p>
          <p className="text-muted-foreground text-xs">Manage subscription</p>
        </div>
      </Link>
    )
  }

  // Trial active
  if (
    subscription.status === "trialing" &&
    subscription.daysLeftInTrial != null &&
    subscription.daysLeftInTrial > 0
  ) {
    // If user has selected a plan during trial, show the plan name
    if (subscription.planType) {
      const planName = subscription.planType === "monthly" ? "Monthly Pro" : "Yearly Pro"
      return (
        <Link
          href={billingPath()}
          className="flex items-center gap-3 rounded-lg border border-border/50 bg-muted/30 p-3 transition-colors hover:bg-muted/50"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-cyan-500 to-indigo-500">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{planName}</p>
            <p className="text-muted-foreground text-xs">
              Trial: {subscription.daysLeftInTrial} {subscription.daysLeftInTrial === 1 ? "day" : "days"} left
            </p>
          </div>
        </Link>
      )
    }

    // No plan selected yet, show generic trial message
    return (
      <Link
        href={billingPath()}
        className="flex items-center gap-3 rounded-lg border border-border/50 bg-muted/30 p-3 transition-colors hover:bg-muted/50"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-500/10">
          <Clock className="h-4 w-4 text-blue-500" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">
            Trial: {subscription.daysLeftInTrial} {subscription.daysLeftInTrial === 1 ? "day" : "days"} left
          </p>
          <p className="text-muted-foreground text-xs">Upgrade to Pro</p>
        </div>
      </Link>
    )
  }

  // Trial expired or no active subscription
  return (
    <Link
      href={billingPath()}
      className="flex items-center gap-3 rounded-lg border border-orange-500/30 bg-orange-500/5 p-3 transition-colors hover:bg-orange-500/10"
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-orange-500/10">
        <CreditCard className="h-4 w-4 text-orange-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-orange-600 dark:text-orange-400">
          Get full access now
        </p>
        <p className="text-muted-foreground text-xs">Subscribe to continue</p>
      </div>
    </Link>
  )
}
