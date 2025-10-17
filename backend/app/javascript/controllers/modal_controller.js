import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["container", "backdrop", "dialog"]

  connect() {
    // Listen for Escape key
    this.boundEscapeHandler = this.closeWithEscape.bind(this)
    document.addEventListener("keydown", this.boundEscapeHandler)

    // Auto-open modal when it connects (when turbo-frame loads content)
    this.open()
  }

  disconnect() {
    document.removeEventListener("keydown", this.boundEscapeHandler)
    document.body.style.overflow = ""
  }

  open() {
    // Show the modal
    this.containerTarget.classList.remove("hidden")
    // Prevent body scroll
    document.body.style.overflow = "hidden"

    // Trigger animation on next frame
    requestAnimationFrame(() => {
      this.backdropTarget.classList.remove("opacity-0")
      this.backdropTarget.classList.add("opacity-100")
      this.dialogTarget.classList.remove("opacity-0", "scale-95")
      this.dialogTarget.classList.add("opacity-100", "scale-100")
    })
  }

  close(event) {
    // Close if clicking backdrop or close button
    if (event && event.target !== event.currentTarget && !event.target.closest("[data-modal-close]")) {
      return
    }

    // Prevent default link behavior
    if (event) event.preventDefault()

    // Animate out
    this.backdropTarget.classList.remove("opacity-100")
    this.backdropTarget.classList.add("opacity-0")
    this.dialogTarget.classList.remove("opacity-100", "scale-100")
    this.dialogTarget.classList.add("opacity-0", "scale-95")

    // Hide after animation completes and clear the turbo-frame
    setTimeout(() => {
      this.containerTarget.classList.add("hidden")
      document.body.style.overflow = ""

      // Clear the turbo-frame to remove modal content
      const turboFrame = this.element.closest('turbo-frame')
      if (turboFrame) {
        turboFrame.innerHTML = ''
        turboFrame.removeAttribute('src')
      }
    }, 300)
  }

  closeWithEscape(event) {
    if (event.key === "Escape") {
      this.close()
    }
  }
}
