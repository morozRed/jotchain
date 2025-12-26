import { Head, Link, usePage } from "@inertiajs/react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import AppLayout from "@/layouts/app-layout"
import SettingsLayout from "@/layouts/settings/layout"
import { sessionPath } from "@/routes"
import type { Session, SharedData } from "@/types"

interface SessionsProps {
  sessions: Session[]
}

export default function Sessions({ sessions }: SessionsProps) {
  const { auth } = usePage<SharedData>().props

  return (
    <AppLayout>
      <Head title="Sessions" />

      <SettingsLayout>
        <section>
          <h2 className="text-[15px] font-medium text-foreground">
            Sessions
          </h2>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Manage your active sessions across devices
          </p>

          <div className="mt-6 space-y-3">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="flex items-start justify-between rounded-lg border border-border bg-background p-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-medium text-foreground">
                      {session.user_agent}
                    </span>
                    {session.id === auth.session.id && (
                      <Badge variant="secondary" className="text-[11px]">
                        Current
                      </Badge>
                    )}
                  </div>
                  <p className="text-[12px] text-muted-foreground">
                    IP: {session.ip_address}
                  </p>
                  <p className="text-[12px] text-muted-foreground">
                    Active since: {new Date(session.created_at).toLocaleString()}
                  </p>
                </div>
                {session.id !== auth.session.id && (
                  <Button variant="ghost" size="sm" asChild className="text-destructive hover:text-destructive">
                    <Link
                      method="delete"
                      href={sessionPath({ id: session.id })}
                      as="button"
                    >
                      Log out
                    </Link>
                  </Button>
                )}
              </div>
            ))}
          </div>
        </section>
      </SettingsLayout>
    </AppLayout>
  )
}
