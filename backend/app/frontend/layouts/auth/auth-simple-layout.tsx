import { Link } from "@inertiajs/react"
import { Lightbulb, NotebookPen } from "lucide-react"
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
      {/* Subtle coral glow - matches app's warm aesthetic */}
      <div
        className="pointer-events-none absolute inset-x-0 top-[-20%] z-0 mx-auto h-[600px] w-[800px] opacity-25 blur-[100px]"
        style={{ background: "radial-gradient(circle at center, rgba(211, 95, 62, 0.4), transparent 70%)" }}
      />
      <div
        className="pointer-events-none absolute bottom-[-20%] left-[-10%] z-0 h-[400px] w-[400px] opacity-15 blur-[80px]"
        style={{ background: "radial-gradient(circle at center, rgba(211, 95, 62, 0.3), transparent 70%)" }}
      />

      {/* Subtle grain overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.03]"
        style={{ backgroundImage: "var(--grain-pattern)", backgroundRepeat: "repeat" }}
      />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-12 px-6 py-12 md:flex-row md:items-center md:justify-between md:gap-16 md:px-10 lg:px-12">
        {/* Left column - Marketing content */}
        <div className="flex max-w-xl flex-col gap-10">
          <Link
            href={rootPath()}
            className="group flex items-center gap-3"
          >
            <span className="flex size-10 items-center justify-center rounded-lg border border-border bg-surface shadow-sm transition-shadow group-hover:shadow-md">
              <AppLogoIcon className="size-5 text-primary" />
            </span>
            <span className="font-heading text-lg font-semibold tracking-tight text-foreground">
              JotChain
            </span>
          </Link>

          <div className="space-y-5">
            <h1 className="font-heading text-[28px] font-semibold leading-[1.15] tracking-tight text-foreground md:text-[34px] lg:text-[38px]">
              Jot notes.
              <br />
              <span className="text-primary">See patterns emerge.</span>
            </h1>
            <p className="max-w-md text-[15px] leading-relaxed text-muted-foreground">
              Capture what's happening at work. Over time, AI surfaces the patterns you'd otherwise miss—blockers, wins, recurring themes.
            </p>
          </div>

          <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <AuthHighlight
              icon={NotebookPen}
              title="Quick capture"
              description="Jot context in seconds. Tag projects and people as you go."
            />
            <AuthHighlight
              icon={Lightbulb}
              title="Patterns surface"
              description="Signals appear after a few days of notes. No setup required."
            />
          </dl>
        </div>

        {/* Right column - Auth form */}
        <div className="w-full max-w-md md:w-[400px]">
          <div className="rounded-xl border border-border bg-surface p-8 shadow-sm">
            <div className="space-y-1.5">
              <h2 className="font-heading text-xl font-semibold tracking-tight text-foreground">
                {title}
              </h2>
              <p className="text-[14px] leading-relaxed text-muted-foreground">
                {description}
              </p>
            </div>
            <div className="mt-7">{children}</div>
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
    <div className="flex items-start gap-3 rounded-lg border border-border-subtle bg-subtle/50 p-4 transition-colors hover:bg-subtle">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary-soft-bg text-primary">
        <Icon className="size-4" strokeWidth={2} />
      </span>
      <div className="space-y-0.5">
        <dt className="text-[13px] font-semibold text-foreground">{title}</dt>
        <dd className="text-[12px] leading-relaxed text-muted-foreground">{description}</dd>
      </div>
    </div>
  )
}
