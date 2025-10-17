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

    // Register global helper to open modals with context
    if (!window.openModal) {
      window.openModal = (modalId, context = {}) => {
        const modal = document.getElementById(modalId)
        if (!modal) return

        const presetContext = context || {}
        modal.dataset.modalContext = JSON.stringify(presetContext)

        const presetEvent = new CustomEvent('modal:preset', {
          detail: presetContext,
          bubbles: true
        })

        // Dispatch for legacy listeners on the modal element
        modal.dispatchEvent(presetEvent)
        // Dispatch globally so child controllers can react
        window.dispatchEvent(new CustomEvent('modal:preset', { detail: { modalId, ...presetContext } }))

        // Show the modal
        modal.classList.remove('hidden')
        document.body.style.overflow = 'hidden'

        // Trigger animations on next frame
        requestAnimationFrame(() => {
          const backdrop = modal.querySelector('[data-modal-target="backdrop"]')
          const dialog = modal.querySelector('[data-modal-target="dialog"]')

          if (backdrop) {
            backdrop.classList.remove('opacity-0')
            backdrop.classList.add('opacity-100')
          }
          if (dialog) {
            dialog.classList.remove('opacity-0', 'scale-95')
            dialog.classList.add('opacity-100', 'scale-100')
          }
        })
      }
    }
  }

  disconnect() {
    document.removeEventListener("keydown", this.boundEscapeHandler)
    document.body.style.overflow = ""
  }
}
