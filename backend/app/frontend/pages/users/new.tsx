import { Form, Head } from "@inertiajs/react"
import { LoaderCircle } from "lucide-react"

import GoogleSignInButton from "@/components/google-sign-in-button"
import InputError from "@/components/input-error"
import TextLink from "@/components/text-link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import AuthLayout from "@/layouts/auth-layout"
import { signInPath, signUpPath } from "@/routes"

export default function Register() {
  return (
    <AuthLayout
      title="Start capturing"
      description="Begin with a few notes. Patterns will emerge over time."
    >
      <Head title="Sign up" />
      <div className="flex flex-col gap-5">
        <GoogleSignInButton />

        <div className="relative py-3">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border-subtle" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-surface px-3 text-[12px] text-muted-foreground">
              or sign up with email
            </span>
          </div>
        </div>

        <Form
          method="post"
          action={signUpPath()}
          resetOnSuccess={["password", "password_confirmation"]}
          className="flex flex-col gap-4"
        >
          {({ processing, errors }) => (
            <div className="grid gap-4">
              <div className="grid gap-1.5">
                <Label htmlFor="name" className="text-[13px] font-medium">
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
                  className="h-10"
                  aria-invalid={Boolean(errors.name)}
                />
                <InputError message={errors.name} />
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="email" className="text-[13px] font-medium">
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
                  className="h-10"
                  aria-invalid={Boolean(errors.email)}
                />
                <InputError message={errors.email} />
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="password" className="text-[13px] font-medium">
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
                  className="h-10"
                  aria-invalid={Boolean(errors.password)}
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
                  required
                  tabIndex={4}
                  autoComplete="new-password"
                  placeholder="Re-enter password"
                  className="h-10"
                  aria-invalid={Boolean(errors.password_confirmation)}
                />
                <InputError message={errors.password_confirmation} />
              </div>

              <Button
                type="submit"
                className="mt-1 h-10 w-full"
                tabIndex={5}
                disabled={processing}
              >
                {processing && (
                  <LoaderCircle className="mr-2 size-4 animate-spin" />
                )}
                Start free trial
              </Button>

              <p className="text-center text-[11px] leading-relaxed text-muted-foreground">
                14-day free trial, no credit card required
              </p>
            </div>
          )}
        </Form>

        <p className="text-center text-[13px] text-muted-foreground">
          Already part of JotChain?{" "}
          <TextLink
            href={signInPath()}
            className="font-medium text-primary hover:text-primary-hover"
            tabIndex={6}
          >
            Log in
          </TextLink>
        </p>
      </div>
    </AuthLayout>
  )
}
