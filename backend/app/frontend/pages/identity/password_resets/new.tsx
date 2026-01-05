import { Form, Head } from "@inertiajs/react"
import { LoaderCircle } from "lucide-react"

import InputError from "@/components/input-error"
import TextLink from "@/components/text-link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import AuthLayout from "@/layouts/auth-layout"
import { identityPasswordResetPath, signInPath } from "@/routes"

export default function ForgotPassword() {
  return (
    <AuthLayout
      title="Forgot password"
      description="Enter your email to receive a password reset link"
    >
      <Head title="Forgot password" />

      <div className="flex flex-col gap-5">
        <Form method="post" action={identityPasswordResetPath()}>
          {({ processing, errors }) => (
            <div className="grid gap-4">
              <div className="grid gap-1.5">
                <Label htmlFor="email" className="text-[13px] font-medium">
                  Email address
                </Label>
                <Input
                  id="email"
                  type="email"
                  name="email"
                  autoComplete="off"
                  autoFocus
                  placeholder="you@company.com"
                  className="h-10"
                />
                <InputError message={errors.email} />
              </div>

              <Button
                type="submit"
                className="mt-1 h-10 w-full"
                disabled={processing}
              >
                {processing && (
                  <LoaderCircle className="mr-2 size-4 animate-spin" />
                )}
                Send reset link
              </Button>
            </div>
          )}
        </Form>

        <p className="text-center text-[13px] text-muted-foreground">
          Remember your password?{" "}
          <TextLink
            href={signInPath()}
            className="font-medium text-primary hover:text-primary-hover"
          >
            Back to log in
          </TextLink>
        </p>
      </div>
    </AuthLayout>
  )
}
