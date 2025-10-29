import { Head, Link, usePage } from "@inertiajs/react"
import { CalendarClock, CheckCircle2, NotebookPen, Sparkles } from "lucide-react"
import type { LucideIcon } from "lucide-react"

import AppLogoIcon from "@/components/app-logo-icon"
import { Button } from "@/components/ui/button"
import { dashboardPath, rootPath, signInPath, signUpPath } from "@/routes"
import type { SharedData } from "@/types"

const FEATURE_CARDS = [
  {
    icon: Sparkles,
    title: "AI stand-up briefs",
    description:
      "Summaries land in your inbox 30 minutes before every cadence—daily, weekly, monthly.",
  },
  {
    icon: NotebookPen,
    title: "Lightning-fast capture",
    description:
      "Jot wins in under a minute. Tag by project and watch patterns surface automatically.",
  },
  {
    icon: CalendarClock,
    title: "Cadence-aware scheduling",
    description:
      "Configure stand-ups, syncs, and reviews once. JotChain keeps reminders and digests aligned with your calendar.",
  },
]

const HIGHLIGHTS = [
  "Generate meeting-ready updates in seconds",
  "Spot blockers early with timeline context",
  "Walk into reviews armed with quantified impact",
]

const METRICS = [
  { value: "80%", label: "Less time spent prepping reviews" },
  { value: "10 sec", label: "To spin up a stand-up brief" },
  { value: "24/7", label: "Availability for distributed teams" },
]

export default function Welcome() {
  const page = usePage<SharedData>()
  const { auth } = page.props
  const isAuthenticated = Boolean(auth?.user)

  return (
    <>
      <Head title="JotChain · AI-powered meeting summaries">
        <link rel="preconnect" href="https://fonts.bunny.net" />
        <link
          href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600"
          rel="stylesheet"
        />
      </Head>

      <div className="relative min-h-screen overflow-hidden bg-background text-white">
        <div className="pointer-events-none absolute inset-x-0 top-[-20%] z-0 mx-auto h-[520px] w-[720px] rounded-full bg-[radial-gradient(circle_at_center,rgba(129,140,248,0.9),transparent_70%)] opacity-60 blur-3xl" />
        <div className="pointer-events-none absolute bottom-[-30%] right-[-10%] z-0 h-[480px] w-[480px] rounded-full bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.9),transparent_70%)] opacity-30 blur-3xl" />

        <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-8 md:px-10 lg:px-12">
          <Link
            href={rootPath()}
            className="flex items-center gap-3 text-lg font-semibold text-white"
          >
            <span className="flex size-11 items-center justify-center rounded-md border border-white/10 bg-white/5 backdrop-blur">
              <AppLogoIcon className="size-6 text-white" />
            </span>
            JotChain
          </Link>

          <nav className="hidden items-center gap-8 text-sm text-white/70 md:flex">
            <a className="hover:text-white" href="#features">
              Features
            </a>
            <a className="hover:text-white" href="#metrics">
              Results
            </a>
            <a className="hover:text-white" href="#cta">
              Pricing
            </a>
          </nav>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Button
                asChild
                variant="ghost"
                className="border border-white/20 bg-white/10 text-white hover:bg-white/20"
              >
                <Link href={dashboardPath()}>Go to dashboard</Link>
              </Button>
            ) : (
              <>
                <Button
                  asChild
                  variant="ghost"
                  className="hidden border border-white/20 bg-white/0 text-white hover:bg-white/10 md:inline-flex"
                >
                  <Link href={signInPath()}>Log in</Link>
                </Button>
                <Button
                  asChild
                  className="bg-primary text-primary-foreground hover:bg-primary/80"
                >
                  <Link href={signUpPath()}>Start free trial</Link>
                </Button>
              </>
            )}
          </div>
        </header>

        <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-20 px-6 pb-24 md:px-10 lg:px-12">
          <section className="grid gap-12 pt-10 md:grid-cols-[minmax(0,1.1fr),minmax(0,0.9fr)] md:items-center">
            <div className="space-y-8">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-white/90">
                <Sparkles className="size-3.5" />
                Built for shipping teams
              </span>
              <div className="space-y-6">
                <h1 className="text-pretty text-4xl font-semibold leading-tight text-white md:text-5xl">
                  The fastest path from daily notes to meeting-ready updates.
                </h1>
                <p className="text-pretty text-sm text-white/70 md:text-base">
                  JotChain keeps your highlights organized, understands your
                  cadence, and sends summaries that sound like you. No more blank
                  stares when someone asks &ldquo;what happened this week?&rdquo;
                </p>
              </div>
              <ul className="space-y-3 text-sm text-white/75">
                {HIGHLIGHTS.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 size-4 text-accent-hot" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button
                  asChild
                  className="bg-primary px-6 text-primary-foreground shadow-[0_16px_40px_rgba(129,140,248,0.45)] hover:bg-primary/80"
                >
                  <Link href={isAuthenticated ? dashboardPath() : signUpPath()}>
                    {isAuthenticated ? "Open dashboard" : "Start capturing today"}
                  </Link>
                </Button>
                {!isAuthenticated && (
                  <Button
                    asChild
                    variant="ghost"
                    className="border border-white/20 bg-white/0 px-6 text-white hover:bg-white/10"
                  >
                    <Link href={signInPath()}>
                      Already logging? Log in
                    </Link>
                  </Button>
                )}
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-xl">
              <div className="absolute inset-0 -translate-x-6 rounded-3xl bg-gradient-to-br from-primary/30 via-card/60 to-transparent blur-3xl" />
              <div className="relative grid gap-4">
                <div className="rounded-2xl border border-white/10 bg-white/10 p-6 shadow-[0_20px_60px_rgba(8,9,15,0.55)] backdrop-blur">
                  <div className="flex items-center justify-between text-xs text-white/60">
                    <span className="inline-flex items-center gap-2 text-sm font-medium text-white">
                      <Sparkles className="size-4 text-accent-hot" />
                      Daily stand-up brief
                    </span>
                    <span>7:30 AM · PST</span>
                  </div>
                  <ul className="mt-4 space-y-3 text-sm text-white/85">
                    <li className="rounded-lg border border-white/10 bg-white/5 p-3">
                      Shipped usage-based billing &mdash; NRR +6.4%. Call out
                      Casey&apos;s migration unblock.
                    </li>
                    <li className="rounded-lg border border-white/10 bg-white/5 p-3">
                      Flag staging DB performance regression. Mitigation plan in
                      progress.
                    </li>
                    <li className="rounded-lg border border-white/10 bg-white/5 p-3">
                      Upcoming: Prep exec sync on Thursday with revenue lift
                      metrics.
                    </li>
                  </ul>
                  <footer className="mt-4 flex items-center gap-2 text-xs text-white/60">
                    <span className="font-medium uppercase tracking-wide text-white/70">
                      Sources
                    </span>
                    <span className="rounded-full border border-white/15 bg-white/10 px-2 py-0.5">
                      Launch note
                    </span>
                    <span className="rounded-full border border-white/15 bg-white/10 px-2 py-0.5">
                      Stand-up log
                    </span>
                    <span className="rounded-full border border-white/15 bg-white/10 px-2 py-0.5">
                      Retro
                    </span>
                  </footer>
                </div>

                <div className="ml-auto w-[84%] rounded-2xl border border-white/10 bg-card p-6 shadow-[0_14px_32px_rgba(5,7,15,0.5)]">
                  <div className="flex items-center justify-between text-xs text-white/60">
                    <span className="font-semibold uppercase tracking-wide text-white/80">
                      Meeting schedule
                    </span>
                    <span>Auto-send 30 mins early</span>
                  </div>
                  <div className="mt-4 space-y-3 text-sm">
                    <ScheduleRow meeting="Daily stand-up" time="Weekdays · 9:00 AM" />
                    <ScheduleRow meeting="Weekly sync" time="Fridays · 2:00 PM" />
                    <ScheduleRow meeting="Monthly review" time="1st Monday · 10:00 AM" />
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section id="metrics" className="grid gap-6 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur md:grid-cols-3">
            {METRICS.map((metric) => (
              <div key={metric.label} className="flex flex-col gap-2">
                <span className="text-3xl font-semibold text-white md:text-4xl">
                  {metric.value}
                </span>
                <span className="text-sm text-white/70">{metric.label}</span>
              </div>
            ))}
          </section>

          <section id="features" className="grid gap-6 md:grid-cols-3">
            {FEATURE_CARDS.map((feature) => (
              <FeatureCard key={feature.title} {...feature} />
            ))}
          </section>

          <section
            id="cta"
            className="rounded-3xl border border-white/10 bg-gradient-to-br from-primary/90 to-primary/60 p-8 text-white shadow-[0_24px_80px_rgba(129,140,248,0.35)]"
          >
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold">
                  Ready for effortless meeting prep?
                </h2>
                <p className="text-sm text-white/80">
                  Try JotChain free for 14 days. Switch to Pro for $12/month
                  when you&apos;re ready.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  asChild
                  className="bg-white text-primary-foreground hover:bg-white/90"
                >
                  <Link href={isAuthenticated ? dashboardPath() : signUpPath()}>
                    {isAuthenticated ? "Manage plan" : "Start free trial"}
                  </Link>
                </Button>
                {!isAuthenticated && (
                  <Button
                    asChild
                    variant="ghost"
                    className="border border-white/40 bg-transparent text-white hover:bg-white/10"
                  >
                    <Link href={signInPath()}>Log in</Link>
                  </Button>
                )}
              </div>
            </div>
          </section>
        </main>
      </div>
    </>
  )
}

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon
  title: string
  description: string
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white/80 hover:border-white/30 hover:bg-white/10">
      <span className="flex size-10 items-center justify-center rounded-full bg-primary/20 text-accent-hot">
        <Icon className="size-5" />
      </span>
      <h3 className="mt-4 text-lg font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-white/70">{description}</p>
    </div>
  )
}

function ScheduleRow({ meeting, time }: { meeting: string; time: string }) {
  return (
    <div className="flex items-start justify-between rounded-xl border border-white/10 bg-white/5 p-3">
      <div>
        <p className="text-sm font-semibold text-white">{meeting}</p>
        <p className="text-xs text-white/60">{time}</p>
      </div>
      <span className="text-xs text-accent-hot">Enabled</span>
    </div>
  )
}
