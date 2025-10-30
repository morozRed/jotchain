import { router } from "@inertiajs/react"
import { Command, CornerDownLeft, MessageSquare } from "lucide-react"
import { useCallback, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Textarea } from "@/components/ui/textarea"
import { feedbackIndexPath } from "@/routes"

export function FeedbackButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [feedback, setFeedback] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = useCallback(
    (event: React.FormEvent) => {
      event.preventDefault()

      if (!feedback.trim()) return

      setIsSubmitting(true)

      router.post(
        feedbackIndexPath(),
        { feedback: feedback.trim() },
        {
          preserveScroll: true,
          onSuccess: () => {
            setFeedback("")
            setIsOpen(false)
          },
          onFinish: () => {
            setIsSubmitting(false)
          },
        },
      )
    },
    [feedback],
  )

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
        event.preventDefault()
        handleSubmit(event as unknown as React.FormEvent)
      }
    },
    [handleSubmit],
  )

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton onClick={() => setIsOpen(true)}>
            <MessageSquare className="size-4" />
            <span>Feedback</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Send Feedback</DialogTitle>
            <DialogDescription>
              Share your ideas, report issues, or suggest improvements.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ideas to improve this page..."
                className="min-h-[200px] resize-none pb-16"
                autoFocus
                disabled={isSubmitting}
              />
              <Button
                type="submit"
                disabled={!feedback.trim() || isSubmitting}
                className="absolute bottom-3 right-3 gap-2 shadow-md transition-all duration-200"
                size="sm"
              >
                <span>Send</span>
                <div className="flex items-center gap-0.5 text-xs opacity-60">
                  <Command className="size-3" />
                  <CornerDownLeft className="size-3" />
                </div>
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
