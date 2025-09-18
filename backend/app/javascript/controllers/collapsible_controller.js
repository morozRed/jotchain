import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["content", "toggle", "preview"]
  static values = { expanded: Boolean }

  connect() {
    this.expandedValue = false
    // Set initial transition
    if (this.hasContentTarget) {
      this.contentTarget.style.transition = "max-height 0.3s ease-in-out"
    }
    this.updateDisplay()
  }

  toggle() {
    this.expandedValue = !this.expandedValue
    this.updateDisplay()
  }

  updateDisplay() {
    if (!this.hasContentTarget || !this.hasToggleTarget) return

    if (this.expandedValue) {
      // Expand content
      this.expandContent()
    } else {
      // Collapse content
      this.collapseContent()
    }
  }

  expandContent() {
    // Remove line clamp and set height to auto temporarily to get actual height
    this.contentTarget.classList.remove("line-clamp-3")

    // Calculate the full height
    const fullHeight = this.contentTarget.scrollHeight

    // Set max-height for smooth transition - no limit, use full height
    this.contentTarget.style.maxHeight = `${fullHeight}px`
    this.contentTarget.style.overflow = "visible"

    // Update toggle button - just rotate the chevron
    const toggleSvg = this.toggleTarget.querySelector('svg')
    if (toggleSvg) {
      toggleSvg.classList.add('rotate-180')
    }

    // Update title attribute
    this.toggleTarget.setAttribute('title', 'Show less')

    // Hide preview if it exists
    if (this.hasPreviewTarget) {
      this.previewTarget.classList.add("hidden")
    }
  }

  collapseContent() {
    // Add line clamp
    this.contentTarget.classList.add("line-clamp-3")

    // Set a fixed max-height for collapsed state (approximately 3 lines)
    this.contentTarget.style.maxHeight = "4.5rem"
    this.contentTarget.style.overflow = "hidden"

    // Update toggle button - just rotate the chevron back
    const toggleSvg = this.toggleTarget.querySelector('svg')
    if (toggleSvg) {
      toggleSvg.classList.remove('rotate-180')
    }

    // Update title attribute
    this.toggleTarget.setAttribute('title', 'Show more')

    // Show preview if it exists
    if (this.hasPreviewTarget) {
      this.previewTarget.classList.remove("hidden")
    }
  }

  // Handle window resize to recalculate heights if needed
  handleResize = () => {
    if (this.expandedValue && this.hasContentTarget) {
      // Recalculate height when window resizes
      this.contentTarget.style.maxHeight = `${this.contentTarget.scrollHeight}px`
    }
  }

  disconnect() {
    window.removeEventListener('resize', this.handleResize)
  }
}