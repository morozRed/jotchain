import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["container", "backdrop", "dialog"]

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

    // Animate out
    this.backdropTarget.classList.remove("opacity-100")
    this.backdropTarget.classList.add("opacity-0")
    this.dialogTarget.classList.remove("opacity-100", "scale-100")
    this.dialogTarget.classList.add("opacity-0", "scale-95")

    // Hide after animation completes (300ms)
    setTimeout(() => {
      this.containerTarget.classList.add("hidden")
      document.body.style.overflow = ""
    }, 300)
  }

  closeWithEscape(event) {
    if (event.key === "Escape") {
      this.close()
    }
  }

  connect() {
    // Listen for Escape key
    this.boundEscapeHandler = this.closeWithEscape.bind(this)
    document.addEventListener("keydown", this.boundEscapeHandler)

    // Register global helper to open modals
    if (!window.openModal) {
      window.openModal = (modalId) => {
        const modal = document.getElementById(modalId)
        if (modal) {
          const controller = this.application.getControllerForElementAndIdentifier(modal, 'modal')
          if (controller) {
            controller.open()
          }
        }
      }
    }
  }

  disconnect() {
    document.removeEventListener("keydown", this.boundEscapeHandler)
    document.body.style.overflow = ""
  }
}
