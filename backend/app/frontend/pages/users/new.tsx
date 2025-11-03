import { Form, Head } from "@inertiajs/react"
import { ArrowRight, LoaderCircle, Sparkles } from "lucide-react"

import GoogleSignInButton from "@/components/google-sign-in-button"
import InputError from "@/components/input-error"
import TextLink from "@/components/text-link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import AuthLayout from "@/layouts/auth-layout"
import { signInPath, signUpPath } from "@/routes"

const trialHighlights = [
  "14-day free trial, no credit card",
  "Unlimited meeting summaries",
  "Invite teammates when you’re ready",
]

export default function Register() {
  return (
    <AuthLayout
      title="Create your JotChain workspace"
      description="Capture today’s wins and let AI craft tomorrow’s stand-up brief."
    >
      <Head title="Sign up • JotChain" />
      <div className="flex flex-col gap-6">
        <div className="flex justify-center">
          <GoogleSignInButton />
        </div>

        <div className="relative">
          <Separator className="my-4" />
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-xs text-muted-foreground">
            or
          </span>
        </div>

        <Form
          method="post"
          action={signUpPath()}
          resetOnSuccess={["password", "password_confirmation"]}
          className="flex flex-col gap-6"
        >
          {({ processing, errors }) => (
            <div className="grid gap-5">
              <div className="grid gap-2">
                <Label htmlFor="name" className="text-sm">
                  Your name
                </Label>
                <Input
                  id="name"
                  type="text"
                  name="name"
                  required
                  autoFocus
                  tabIndex={1}
                  autoComplete="name"
                  disabled={processing}
                  placeholder="Jordan Lee"
                  aria-invalid={Boolean(errors.name)}
                />
                <InputError message={errors.name} className="mt-1" />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email" className="text-sm">
                  Work email
                </Label>
                <Input
                  id="email"
                  type="email"
                  name="email"
                  required
                  tabIndex={2}
                  autoComplete="email"
                  placeholder="you@company.com"
                  aria-invalid={Boolean(errors.email)}
                />
                <InputError message={errors.email} />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="password" className="text-sm">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  name="password"
                  required
                  tabIndex={3}
                  autoComplete="new-password"
                  placeholder="At least 12 characters"
                  aria-invalid={Boolean(errors.password)}
                />
                <InputError message={errors.password} />
              </div>

              <div className="grid gap-2">
                <Label
                  htmlFor="password_confirmation"
                  className="text-sm"
                >
                  Confirm password
                </Label>
                <Input
                  id="password_confirmation"
                  type="password"
                  name="password_confirmation"
                  required
                  tabIndex={4}
                  autoComplete="new-password"
                  placeholder="Re-enter password"
                  aria-invalid={Boolean(errors.password_confirmation)}
                />
                <InputError message={errors.password_confirmation} />
              </div>

              <Button
                type="submit"
                className="mt-2 w-full bg-primary text-primary-foreground hover:bg-primary/80"
                tabIndex={5}
                disabled={processing}
              >
                {processing && (
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                )}
                Start free trial
              </Button>
            </div>
          )}
        </Form>

        <div className="text-center text-sm text-muted-foreground">
          Already part of JotChain?{" "}
          <TextLink
            href={signInPath()}
            className="text-accent-hot hover:text-foreground"
            tabIndex={6}
          >
            Log in
          </TextLink>
        </div>
      </div>
    </AuthLayout>
  )
}
