import { Form, Head } from "@inertiajs/react"
import { ArrowRight, LoaderCircle, Sparkles } from "lucide-react"

import InputError from "@/components/input-error"
import TextLink from "@/components/text-link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
      title="Create your MeetingPrep workspace"
      description="Capture today’s wins and let AI craft tomorrow’s stand-up brief."
    >
      <Head title="Sign up • MeetingPrep" />
      <Form
        method="post"
        action={signUpPath()}
        resetOnSuccess={["password", "password_confirmation"]}
        className="flex flex-col gap-6"
      >
        {({ processing, errors }) => (
          <>
            <div className="rounded-lg border border-white/8 bg-white/5 p-4 text-sm text-white/70">
              <div className="flex items-center gap-2 font-semibold text-white">
                <Sparkles className="size-4 text-[#FFB1A8]" />
                What you unlock
              </div>
              <ul className="mt-2 space-y-1.5 text-xs leading-relaxed">
                {trialHighlights.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <ArrowRight className="mt-0.5 size-3 text-[#FFB1A8]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid gap-5">
              <div className="grid gap-2">
                <Label htmlFor="name" className="text-sm text-white/80">
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
                <Label htmlFor="email" className="text-sm text-white/80">
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
                <Label htmlFor="password" className="text-sm text-white/80">
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
                  className="text-sm text-white/80"
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
                className="mt-2 w-full bg-[#FF4433] text-white transition hover:bg-[#d92b1a]"
                tabIndex={5}
                disabled={processing}
              >
                {processing && (
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                )}
                Start free trial
              </Button>
            </div>

            <div className="text-center text-sm text-white/60">
              Already part of MeetingPrep?{" "}
              <TextLink
                href={signInPath()}
                className="text-[#FFB1A8] hover:text-white"
                tabIndex={6}
              >
                Log in
              </TextLink>
            </div>
          </>
        )}
      </Form>
    </AuthLayout>
  )
}
