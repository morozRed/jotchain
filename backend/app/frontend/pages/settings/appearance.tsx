import { Head } from "@inertiajs/react"
import { Sun } from "lucide-react"

import AppLayout from "@/layouts/app-layout"
import SettingsLayout from "@/layouts/settings/layout"

export default function Appearance() {
  return (
    <AppLayout>
      <Head title="Appearance settings" />

      <SettingsLayout>
        <section>
          <h2 className="text-[15px] font-medium text-foreground">
            Appearance
          </h2>
          <p className="mt-1 text-[13px] text-muted-foreground">
            JotChain uses a light, paper-like theme for optimal readability
          </p>

          <div className="mt-6 flex items-center gap-3 rounded-lg border border-border bg-background p-4">
            <div className="flex size-10 items-center justify-center rounded-full bg-amber-100">
              <Sun className="size-5 text-amber-600" />
            </div>
            <div>
              <p className="text-[13px] font-medium text-foreground">
                Light mode
              </p>
              <p className="text-[12px] text-muted-foreground">
                Designed for comfortable reading and writing
              </p>
            </div>
          </div>
        </section>
      </SettingsLayout>
    </AppLayout>
  )
}
