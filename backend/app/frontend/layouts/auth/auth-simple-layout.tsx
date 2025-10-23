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
    <div className="relative min-h-screen overflow-hidden bg-background text-white">
      <div className="pointer-events-none absolute inset-x-0 top-[-40%] z-0 mx-auto h-[480px] w-[720px] rounded-full bg-[radial-gradient(circle_at_center,rgba(129,140,248,0.9),transparent_70%)] opacity-60 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-30%] right-[-10%] z-0 h-[480px] w-[480px] rounded-full bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.9),transparent_70%)] opacity-30 blur-3xl" />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-12 px-6 py-12 md:flex-row md:items-center md:justify-between md:gap-16 md:px-10 lg:px-12">
        <div className="flex max-w-xl flex-col gap-8">
          <Link
            href={rootPath()}
            className="flex items-center gap-3 text-lg font-semibold tracking-tight text-white"
          >
            <span className="flex size-11 items-center justify-center rounded-md border border-white/10 bg-white/5 backdrop-blur">
              <AppLogoIcon className="size-6 text-white" />
            </span>
            JotChain
          </Link>

          <div className="space-y-4">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.1em] text-white/90">
              <Sparkles className="size-3.5" />
              AI Stand-Up Co-Pilot
            </span>
            <h1 className="text-pretty text-3xl font-semibold leading-tight text-white md:text-4xl lg:text-[40px]">
              Prep less, say more. <br/> JotChain turns daily notes into meeting-ready briefs.
            </h1>
            <p className="text-pretty text-sm text-white/70 md:text-base">
              Log wins in under a minute, and receive crisp AI summaries before stand-ups, syncs, and reviews. The same playbook powering our landing page now lives inside the product.
            </p>
          </div>

          <dl className="grid grid-cols-1 gap-4 text-sm text-white/80 md:grid-cols-2">
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
          <div className="rounded-2xl border border-white/8 bg-white/10 p-8 shadow-[0_8px_40px_rgba(13,14,18,0.35)] backdrop-blur-lg">
            <div className="space-y-2 text-left">
              <h2 className="text-2xl font-semibold text-white">{title}</h2>
              <p className="text-sm text-white/70">{description}</p>
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
    <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-4">
      <span className="mt-1 flex size-9 items-center justify-center rounded-full text-accent-hot">
        <Icon className="size-4" />
      </span>
      <div className="space-y-1">
        <dt className="text-sm font-semibold text-white">{title}</dt>
        <dd className="text-xs text-white/60">{description}</dd>
      </div>
    </div>
  )
}
