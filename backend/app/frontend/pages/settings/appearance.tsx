import { Head } from "@inertiajs/react"
import { Sun } from "lucide-react"

import HeadingSmall from "@/components/heading-small"
import AppLayout from "@/layouts/app-layout"
import SettingsLayout from "@/layouts/settings/layout"
import { settingsAppearancePath } from "@/routes"
import type { BreadcrumbItem } from "@/types"

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: "Appearance settings",
    href: settingsAppearancePath(),
  },
]

export default function Appearance() {
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={breadcrumbs[breadcrumbs.length - 1].title} />

      <SettingsLayout>
        <div className="space-y-6">
          <HeadingSmall
            title="Appearance"
            description="JotChain uses a light, paper-like theme for optimal readability."
          />
          <div className="flex items-center gap-3 rounded-lg border border-border-subtle bg-surface p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-soft-bg">
              <Sun className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-foreground">Light mode</p>
              <p className="text-sm text-muted-foreground">
                Designed for comfortable reading and writing
              </p>
            </div>
          </div>
        </div>
      </SettingsLayout>
    </AppLayout>
  )
}
