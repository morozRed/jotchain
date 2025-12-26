import { Transition } from "@headlessui/react"
import { Form, Head, usePage } from "@inertiajs/react"

import DeleteUser from "@/components/delete-user"
import InputError from "@/components/input-error"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import AppLayout from "@/layouts/app-layout"
import SettingsLayout from "@/layouts/settings/layout"
import { settingsProfilePath } from "@/routes"
import type { SharedData } from "@/types"

export default function Profile() {
  const { auth } = usePage<SharedData>().props

  return (
    <AppLayout>
      <Head title="Profile settings" />

      <SettingsLayout>
        <div className="space-y-8">
          {/* Profile section */}
          <section>
            <h2 className="text-[15px] font-medium text-foreground">
              Profile information
            </h2>
            <p className="mt-1 text-[13px] text-muted-foreground">
              Update your name
            </p>

            <Form
              method="patch"
              action={settingsProfilePath()}
              options={{ preserveScroll: true }}
              className="mt-6"
            >
              {({ errors, processing, recentlySuccessful }) => (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-[13px]">
                      Name
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      defaultValue={auth.user.name}
                      required
                      autoComplete="name"
                      placeholder="Full name"
                      className="max-w-sm"
                    />
                    <InputError message={errors.name} />
                  </div>

                  <div className="mt-4 flex items-center gap-3">
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

          {/* Danger zone */}
          <section className="border-t border-border pt-8">
            <DeleteUser />
          </section>
        </div>
      </SettingsLayout>
    </AppLayout>
  )
}
