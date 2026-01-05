import { Transition } from "@headlessui/react"
import { Form, Head, Link, usePage } from "@inertiajs/react"

import InputError from "@/components/input-error"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import AppLayout from "@/layouts/app-layout"
import SettingsLayout from "@/layouts/settings/layout"
import { identityEmailVerificationPath, settingsEmailPath } from "@/routes"
import type { SharedData } from "@/types"

export default function Email() {
  const { auth } = usePage<SharedData>().props

  return (
    <AppLayout>
      <Head title="Email settings" />

      <SettingsLayout>
        <section>
          <h2 className="text-[15px] font-medium text-foreground">
            Update email
          </h2>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Update your email address and verify it
          </p>

          <Form
            method="patch"
            action={settingsEmailPath()}
            options={{ preserveScroll: true }}
            resetOnError={["password_challenge"]}
            resetOnSuccess={["password_challenge"]}
            className="mt-6 space-y-4"
          >
            {({ errors, processing, recentlySuccessful }) => (
              <>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-[13px]">
                    Email address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    name="email"
                    defaultValue={auth.user.email}
                    required
                    autoComplete="username"
                    placeholder="Email address"
                    className="max-w-sm"
                  />
                  <InputError message={errors.email} />
                </div>

                {!auth.user.verified && (
                  <p className="text-[13px] text-muted-foreground">
                    Your email address is unverified.{" "}
                    <Link
                      href={identityEmailVerificationPath()}
                      method="post"
                      as="button"
                      className="text-foreground underline underline-offset-4 hover:text-foreground/80"
                    >
                      Click here to resend the verification email.
                    </Link>
                  </p>
                )}

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

                <div className="flex items-center gap-3 pt-2">
                  <Button size="sm" disabled={processing}>
                    Save
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
