import { Transition } from "@headlessui/react"
import { Form, Head } from "@inertiajs/react"

import InputError from "@/components/input-error"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import AppLayout from "@/layouts/app-layout"
import SettingsLayout from "@/layouts/settings/layout"
import { settingsPasswordPath } from "@/routes"

export default function Password() {
  return (
    <AppLayout>
      <Head title="Password settings" />

      <SettingsLayout>
        <section>
          <h2 className="text-[15px] font-medium text-foreground">
            Update password
          </h2>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Ensure your account is using a long, random password to stay secure
          </p>

          <Form
            method="put"
            action={settingsPasswordPath()}
            options={{ preserveScroll: true }}
            resetOnError
            resetOnSuccess
            className="mt-6 space-y-4"
          >
            {({ errors, processing, recentlySuccessful }) => (
              <>
                <div className="space-y-2">
                  <Label htmlFor="password_challenge" className="text-[13px]">
                    Current password
                  </Label>
                  <Input
                    id="password_challenge"
                    name="password_challenge"
                    type="password"
                    autoComplete="current-password"
                    placeholder="Current password"
                    className="max-w-sm"
                  />
                  <InputError message={errors.password_challenge} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-[13px]">
                    New password
                  </Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    placeholder="New password"
                    className="max-w-sm"
                  />
                  <InputError message={errors.password} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password_confirmation" className="text-[13px]">
                    Confirm password
                  </Label>
                  <Input
                    id="password_confirmation"
                    name="password_confirmation"
                    type="password"
                    autoComplete="new-password"
                    placeholder="Confirm password"
                    className="max-w-sm"
                  />
                  <InputError message={errors.password_confirmation} />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <Button size="sm" disabled={processing}>
                    Save password
                  </Button>
                  <Transition
                    show={recentlySuccessful}
                    enter="transition ease-out duration-200"
                    enterFrom="opacity-0"
                    leave="transition ease-in duration-150"
                    leaveTo="opacity-0"
                  >
                    <span className="text-[13px] text-muted-foreground">
                      Saved
                    </span>
                  </Transition>
                </div>
              </>
            )}
          </Form>
        </section>
      </SettingsLayout>
    </AppLayout>
  )
}
