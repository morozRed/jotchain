import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["bubble"]

  connect() {
    // Check if user has seen the tooltip before
    const hasSeenTooltip = localStorage.getItem('hasSeenTooltip')

    if (!hasSeenTooltip) {
      // Show tooltip after a short delay
      setTimeout(() => {
        this.show()
      }, 500)
    }
  }

  show() {
    if (this.hasBubbleTarget) {
      this.bubbleTarget.classList.remove('hidden')
      this.bubbleTarget.classList.add('animate-fade-in')
    }
  }

  dismiss() {
    if (this.hasBubbleTarget) {
      // Add fade out animation
      this.bubbleTarget.classList.add('animate-fade-out')

      // Hide after animation completes
      setTimeout(() => {
        this.bubbleTarget.classList.add('hidden')
        // Store that user has seen the tooltip
        localStorage.setItem('hasSeenTooltip', 'true')
      }, 200)
    }
  }
}