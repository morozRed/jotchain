import { Form, Head } from "@inertiajs/react"
import { LoaderCircle } from "lucide-react"

import InputError from "@/components/input-error"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import AuthLayout from "@/layouts/auth-layout"
import { identityPasswordResetPath } from "@/routes"

interface ResetPasswordProps {
  sid: string
  email: string
}

export default function ResetPassword({ sid, email }: ResetPasswordProps) {
  return (
    <AuthLayout
      title="Reset password"
      description="Please enter your new password below"
    >
      <Head title="Reset password" />
      <Form
        method="put"
        action={identityPasswordResetPath()}
        transform={(data) => ({ ...data, sid, email })}
        resetOnSuccess={["password", "password_confirmation"]}
      >
        {({ processing, errors }) => (
          <div className="grid gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="email" className="text-[13px] font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                name="email"
                autoComplete="email"
                value={email}
                className="h-10 bg-subtle text-muted-foreground"
                readOnly
              />
              <InputError message={errors.email} />
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="password" className="text-[13px] font-medium">
                New password
              </Label>
              <Input
                id="password"
                type="password"
                name="password"
                autoComplete="new-password"
                autoFocus
                placeholder="At least 12 characters"
                className="h-10"
              />
              <InputError message={errors.password} />
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="password_confirmation" className="text-[13px] font-medium">
                Confirm password
              </Label>
              <Input
                id="password_confirmation"
                type="password"
                name="password_confirmation"
                autoComplete="new-password"
                placeholder="Re-enter password"
                className="h-10"
              />
              <InputError message={errors.password_confirmation} />
            </div>

            <Button
              type="submit"
              className="mt-1 h-10 w-full"
              disabled={processing}
            >
              {processing && (
                <LoaderCircle className="mr-2 size-4 animate-spin" />
              )}
              Reset password
            </Button>
          </div>
        )}
      </Form>
    </AuthLayout>
  )
}
