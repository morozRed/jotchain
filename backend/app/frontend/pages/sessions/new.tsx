import { Form, Head } from "@inertiajs/react"
import { LoaderCircle, ShieldCheck } from "lucide-react"

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
      title="Log in to MeetingPrep"
      description="Pick up where you left off. Your AI summaries are already queued."
    >
      <Head title="Log in • MeetingPrep" />
      <Form
        method="post"
        action={signInPath()}
        resetOnSuccess={["password"]}
        className="flex flex-col gap-6"
      >
        {({ processing, errors }) => (
          <>
            <div className="rounded-lg border border-white/8 bg-white/5 p-4 text-xs text-white/70">
              <div className="flex items-center gap-2 font-medium text-white">
                <ShieldCheck className="size-4 text-[#FFB1A8]" />
                Security first
              </div>
              <p className="mt-1 leading-relaxed">
                Two-step verification follows the first login. Your notes stay encrypted at rest.
              </p>
            </div>

            <div className="grid gap-5">
              <div className="grid gap-2">
                <Label htmlFor="email" className="text-sm text-white/80">
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
                  aria-invalid={Boolean(errors.email)}
                />
                <InputError message={errors.email} />
              </div>

              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label
                    htmlFor="password"
                    className="text-sm text-white/80"
                  >
                    Password
                  </Label>
                  <TextLink
                    href={newIdentityPasswordResetPath()}
                    className="ml-auto text-sm text-[#FFB1A8] hover:text-white"
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
                  placeholder="••••••••••"
                  aria-invalid={Boolean(errors.password)}
                />
                <InputError message={errors.password} />
              </div>

              <Button
                type="submit"
                className="mt-2 w-full bg-[#FF4433] text-white transition hover:bg-[#d92b1a]"
                tabIndex={3}
                disabled={processing}
              >
                {processing && (
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                )}
                Log in
              </Button>
            </div>

            <div className="text-center text-sm text-white/60">
              Need an account?{" "}
              <TextLink
                href={signUpPath()}
                className="text-[#FFB1A8] hover:text-white"
                tabIndex={5}
              >
                Start your free trial
              </TextLink>
            </div>
          </>
        )}
      </Form>
    </AuthLayout>
  )
}
