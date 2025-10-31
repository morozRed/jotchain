import { Head, router, usePage } from "@inertiajs/react"
import { Check, CreditCard } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import AppLayout from "@/layouts/app-layout"
import { billingCheckoutPath, billingPortalPath } from "@/routes"
import type { BreadcrumbItem, SharedData } from "@/types"

type SubscriptionPayload = {
  status: string
  planType: string | null
  trialEndsAt: string | null
  currentPeriodEnd: string | null
  daysLeftInTrial: number
  activeSubscription: boolean
  trialActive: boolean
  trialExpired: boolean
}

type PlanPayload = {
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
}

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: "Billing",
    href: "/billing",
  },
]

export default function Billing() {
  const { subscription, plans } = usePage<PageProps>().props

  const handleUpgrade = (planType: string) => {
    router.post(billingCheckoutPath(), { plan_type: planType })
  }

  const handleManageSubscription = () => {
    router.post(billingPortalPath(), {})
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
                <p className="text-muted-foreground text-sm">
                  Your subscription is active
                  {subscription.currentPeriodEnd && (
                    <> until {new Date(subscription.currentPeriodEnd).toLocaleDateString()}</>
                  )}
                </p>
                <Button onClick={handleManageSubscription} variant="outline" className="mt-4">
                  Manage Subscription
                </Button>
              </div>
            ) : subscription.trialActive ? (
              <div className="space-y-2">
                <p className="text-lg font-semibold">Free Trial</p>
                <p className="text-muted-foreground text-sm">
                  {subscription.daysLeftInTrial} days left in your trial
                </p>
                <p className="text-muted-foreground text-sm">
                  Upgrade now to continue enjoying all features after your trial ends
                </p>
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

        {/* Pricing Plans */}
        {!subscription.activeSubscription && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Upgrade to Pro</h2>
            <div className="grid gap-6 md:grid-cols-2">
              {plans.map((plan) => (
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
                      onClick={() => handleUpgrade(plan.id)}
                      className="w-full"
                      variant={plan.id === "yearly" ? "default" : "outline"}
                    >
                      Subscribe to {plan.name}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
