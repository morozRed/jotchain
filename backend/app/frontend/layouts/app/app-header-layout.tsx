import type { PropsWithChildren } from "react"

import { AppContent } from "@/components/app-content"
import { AppHeader } from "@/components/app-header"
import { AppShell } from "@/components/app-shell"

interface AppHeaderLayoutProps {
  onCommandOpen?: () => void
}

export default function AppHeaderLayout({
  children,
  onCommandOpen,
}: PropsWithChildren<AppHeaderLayoutProps>) {
  return (
    <AppShell variant="header">
      <AppHeader onCommandOpen={onCommandOpen} />
      <AppContent variant="header">{children}</AppContent>
    </AppShell>
  )
}
