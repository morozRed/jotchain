import { Link } from "@inertiajs/react"
import { CalendarClock, NotebookPen, Sparkles } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import type { PropsWithChildren } from "react"

import AppLogoIcon from "@/components/app-logo-icon"
import { rootPath } from "@/routes"

interface AuthLayoutProps {
  name?: string
  title?: string
  description?: string
}

export default function AuthSimpleLayout({
  children,
  title,
  description,
}: PropsWithChildren<AuthLayoutProps>) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-x-0 top-[-40%] z-0 mx-auto h-[480px] w-[720px] rounded-full bg-[radial-gradient(circle_at_center,rgba(47,93,80,0.3),transparent_70%)] opacity-40 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-30%] right-[-10%] z-0 h-[480px] w-[480px] rounded-full bg-[radial-gradient(circle_at_center,rgba(47,93,80,0.2),transparent_70%)] opacity-30 blur-3xl" />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-12 px-6 py-12 md:flex-row md:items-center md:justify-between md:gap-16 md:px-10 lg:px-12">
        <div className="flex max-w-xl flex-col gap-8">
          <Link
            href={rootPath()}
            className="flex items-center gap-3 text-lg font-semibold tracking-tight text-foreground"
          >
            <span className="flex size-11 items-center justify-center rounded-md border border-border bg-muted/50 backdrop-blur">
              <AppLogoIcon className="size-6 text-foreground" />
            </span>
            JotChain
          </Link>

          <div className="space-y-4">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-muted px-4 py-1 text-xs font-semibold uppercase tracking-[0.1em] text-foreground/90">
              <Sparkles className="size-3.5" />
              AI Stand-Up Co-Pilot
            </span>
            <h1 className="text-pretty text-3xl font-semibold leading-tight text-foreground md:text-4xl lg:text-[40px]">
              Prep less, say more. <br/> JotChain turns daily notes into meeting-ready briefs.
            </h1>
            <p className="text-pretty text-sm text-muted-foreground md:text-base">
              Log wins in under a minute, and receive crisp AI summaries before stand-ups, syncs, and reviews. The same playbook powering our landing page now lives inside the product.
            </p>
          </div>

          <dl className="grid grid-cols-1 gap-4 text-sm text-muted-foreground md:grid-cols-2">
            <AuthHighlight
              icon={NotebookPen}
              title="Jot anywhere"
              description="End-of-day capture with tags that keep projects aligned."
            />
            <AuthHighlight
              icon={CalendarClock}
              title="Right on time"
              description="Auto-email summaries 30 minutes before every cadence."
            />
          </dl>
        </div>

        <div className="w-full max-w-md md:w-[420px]">
          <div className="rounded-2xl border border-border bg-card p-8 shadow-lg backdrop-blur-lg">
            <div className="space-y-2 text-left">
              <h2 className="text-2xl font-semibold text-foreground">{title}</h2>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
            <div className="mt-8">{children}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

function AuthHighlight({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon
  title: string
  description: string
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 p-4">
      <span className="mt-1 flex size-9 items-center justify-center rounded-full text-accent-hot">
        <Icon className="size-4" />
      </span>
      <div className="space-y-1">
        <dt className="text-sm font-semibold text-foreground">{title}</dt>
        <dd className="text-xs text-muted-foreground">{description}</dd>
      </div>
    </div>
  )
}
