import { Form, Head } from "@inertiajs/react"
import { LoaderCircle } from "lucide-react"

import GoogleSignInButton from "@/components/google-sign-in-button"
import InputError from "@/components/input-error"
import TextLink from "@/components/text-link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import AuthLayout from "@/layouts/auth-layout"
import { newIdentityPasswordResetPath, signInPath, signUpPath } from "@/routes"

export default function Login() {
  return (
    <AuthLayout
      title="Welcome back"
      description="Your notes are waiting. New patterns may have surfaced."
    >
      <Head title="Log in" />
      <div className="flex flex-col gap-5">
        <Form
          method="post"
          action={signInPath()}
          resetOnSuccess={["password"]}
          className="flex flex-col gap-4"
        >
          {({ processing, errors }) => (
            <div className="grid gap-4">
              <div className="grid gap-1.5">
                <Label htmlFor="email" className="text-[13px] font-medium">
                  Email address
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoFocus
                  tabIndex={1}
                  autoComplete="email"
                  placeholder="you@team.com"
                  className="h-10"
                  aria-invalid={Boolean(errors.email)}
                />
                <InputError message={errors.email} />
              </div>

              <div className="grid gap-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-[13px] font-medium">
                    Password
                  </Label>
                  <TextLink
                    href={newIdentityPasswordResetPath()}
                    className="text-[12px] text-primary hover:text-primary-hover"
                    tabIndex={4}
                  >
                    Forgot password?
                  </TextLink>
                </div>
                <Input
                  id="password"
                  type="password"
                  name="password"
                  required
                  tabIndex={2}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  className="h-10"
                  aria-invalid={Boolean(errors.password)}
                />
                <InputError message={errors.password} />
              </div>

              <Button
                type="submit"
                className="mt-1 h-10 w-full"
                tabIndex={3}
                disabled={processing}
              >
                {processing && (
                  <LoaderCircle className="mr-2 size-4 animate-spin" />
                )}
                Log in
              </Button>
            </div>
          )}
        </Form>

        <div className="relative py-3">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border-subtle" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-surface px-3 text-[12px] text-muted-foreground">
              or continue with
            </span>
          </div>
        </div>

        <GoogleSignInButton />

        <p className="mt-1 text-center text-[13px] text-muted-foreground">
          Need an account?{" "}
          <TextLink
            href={signUpPath()}
            className="font-medium text-primary hover:text-primary-hover"
            tabIndex={5}
          >
            Start free
          </TextLink>
        </p>
      </div>
    </AuthLayout>
  )
}
