import { Head, router, usePage } from "@inertiajs/react"
import { Check, CreditCard } from "lucide-react"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import AppLayout from "@/layouts/app-layout"
import { billingCancelPath, billingCheckoutPath, billingPortalPath, billingReactivatePath, billingSwitchPath } from "@/routes"
import type { BreadcrumbItem, SharedData } from "@/types"

interface SubscriptionPayload {
  status: string
  planType: string | null
  trialEndsAt: string | null
  currentPeriodEnd: string | null
  daysLeftInTrial: number
  activeSubscription: boolean
  trialActive: boolean
  trialExpired: boolean
  cancelAtPeriodEnd: boolean
}

interface PlanPayload {
  id: string
  name: string
  price: string
  interval: string
  savings?: string
  features: string[]
}

type PageProps = SharedData & {
  subscription: SubscriptionPayload
  plans: PlanPayload[]
  checkout_url?: string
  portal_url?: string
}

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: "Billing",
    href: "/billing",
  },
]

export default function Billing() {
  const { subscription, plans, checkout_url, portal_url } = usePage<PageProps>().props
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)

  // Redirect to Stripe when checkout_url or portal_url is present
  useEffect(() => {
    if (checkout_url) {
      window.location.href = checkout_url
    } else if (portal_url) {
      window.location.href = portal_url
    }
  }, [checkout_url, portal_url])

  const handleUpgrade = (planType: string) => {
    router.post(billingCheckoutPath(), { plan_type: planType })
  }

  const handleManageSubscription = () => {
    router.post(billingPortalPath(), {})
  }

  const handleCancelSubscription = () => {
    setCancelDialogOpen(true)
  }

  const confirmCancelSubscription = () => {
    router.post(billingCancelPath(), {})
    setCancelDialogOpen(false)
  }

  const handleReactivateSubscription = () => {
    router.post(billingReactivatePath(), {})
  }

  const handleSwitchPlan = (planType: string) => {
    router.post(billingSwitchPath(), { plan_type: planType })
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Billing" />

      <div className="mx-auto max-w-4xl space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Billing</h1>
          <p className="text-muted-foreground mt-2">
            Manage your subscription and billing information
          </p>
        </div>

        {/* Current Subscription Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Current Plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            {subscription.activeSubscription ? (
              <div className="space-y-2">
                <p className="text-lg font-semibold">
                  {subscription.planType === "monthly" ? "Monthly Pro" : "Yearly Pro"}
                </p>

                {subscription.cancelAtPeriodEnd ? (
                  <>
                    <p className="text-sm text-amber-600 dark:text-amber-500 font-medium">
                      Your subscription will be canceled on{" "}
                      {subscription.currentPeriodEnd &&
                        new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      You'll keep access until then
                    </p>
                    <div className="flex gap-2 mt-4">
                      <Button onClick={handleReactivateSubscription} variant="default">
                        Reactivate Subscription
                      </Button>
                      <Button onClick={handleManageSubscription} variant="outline">
                        Update Payment Method
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-muted-foreground text-sm">
                      Your subscription is active
                      {subscription.currentPeriodEnd && (
                        <> until {new Date(subscription.currentPeriodEnd).toLocaleDateString()}</>
                      )}
                    </p>
                    <div className="flex gap-2 mt-4">
                      <Button onClick={handleCancelSubscription} variant="outline">
                        Cancel Subscription
                      </Button>
                      <Button onClick={handleManageSubscription} variant="outline">
                        Update Payment Method
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ) : subscription.trialActive ? (
              <div className="space-y-2">
                <p className="text-lg font-semibold">
                  {subscription.planType
                    ? `${subscription.planType === "monthly" ? "Monthly" : "Yearly"} Pro`
                    : "Free Trial"}
                </p>

                {subscription.planType && subscription.cancelAtPeriodEnd ? (
                  <>
                    <p className="text-sm text-amber-600 dark:text-amber-500 font-medium">
                      Your subscription will be canceled when the trial ends on{" "}
                      {subscription.trialEndsAt &&
                        new Date(subscription.trialEndsAt).toLocaleDateString()}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      You won't be charged
                    </p>
                    <div className="flex gap-2 mt-4">
                      <Button onClick={handleReactivateSubscription} variant="default">
                        Reactivate Subscription
                      </Button>
                      <Button onClick={handleManageSubscription} variant="outline">
                        Update Payment Method
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-muted-foreground text-sm">
                      {subscription.planType
                        ? `Trial period: ${subscription.daysLeftInTrial} days remaining`
                        : `${subscription.daysLeftInTrial} days left in your trial`}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      {subscription.planType
                        ? `Your subscription will automatically activate on ${subscription.trialEndsAt ? new Date(subscription.trialEndsAt).toLocaleDateString() : "the trial end date"}`
                        : "Upgrade now to continue enjoying all features after your trial ends"}
                    </p>
                    {subscription.planType && (
                      <div className="flex gap-2 mt-4">
                        <Button onClick={handleCancelSubscription} variant="outline">
                          Cancel Subscription
                        </Button>
                        <Button onClick={handleManageSubscription} variant="outline">
                          Update Payment Method
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-lg font-semibold">Trial Expired</p>
                <p className="text-muted-foreground text-sm">
                  Your trial has ended. Upgrade to Pro to continue using all features.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pricing Plans - Show for all users */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">
            {subscription.activeSubscription || subscription.trialActive ? "Available Plans" : "Upgrade to Pro"}
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            {plans.map((plan) => {
              // Determine button state based on user's current situation
              const isCurrentPlan = subscription.planType === plan.id
              const hasActiveSubscription = subscription.activeSubscription || subscription.trialActive
              const isCanceled = subscription.cancelAtPeriodEnd

              let buttonText = `Subscribe to ${plan.name}`
              let buttonAction = () => handleUpgrade(plan.id)
              let buttonVariant: "default" | "outline" | "secondary" = plan.id === "yearly" ? "default" : "outline"
              let buttonDisabled = false

              if (hasActiveSubscription && subscription.planType) {
                if (isCurrentPlan) {
                  if (isCanceled) {
                    buttonText = "Reactivate"
                    buttonAction = handleReactivateSubscription
                    buttonVariant = "default"
                  } else {
                    buttonText = "Currently Selected"
                    buttonDisabled = true
                    buttonVariant = "secondary"
                  }
                } else {
                  buttonText = `Switch to ${plan.name}`
                  buttonAction = () => handleSwitchPlan(plan.id)
                  buttonVariant = "default"
                }
              }

              return (
                <Card key={plan.id} className="relative">
                  <CardHeader>
                    <CardTitle>{plan.name}</CardTitle>
                    <CardDescription>
                      <span className="text-3xl font-bold text-foreground">{plan.price}</span>
                      <span className="text-muted-foreground">/{plan.interval}</span>
                      {plan.savings && (
                        <span className="ml-2 text-sm font-semibold text-green-600">
                          {plan.savings}
                        </span>
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ul className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <Check className="text-primary mt-0.5 h-4 w-4 flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      onClick={buttonAction}
                      className="w-full"
                      variant={buttonVariant}
                      disabled={buttonDisabled}
                    >
                      {buttonText}
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Cancel Subscription Confirmation Dialog */}
        <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cancel subscription?</DialogTitle>
              <DialogDescription>
                You'll keep access until the end of your billing period
                {subscription.currentPeriodEnd && (
                  <> on {new Date(subscription.currentPeriodEnd).toLocaleDateString()}</>
                )}. You can reactivate anytime before then.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>
                Keep Subscription
              </Button>
              <Button variant="destructive" onClick={confirmCancelSubscription}>
                Cancel Subscription
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  )
}
