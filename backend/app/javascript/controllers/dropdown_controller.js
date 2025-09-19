import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["menu"]

  connect() {
    this.isOpen = false
    // Close dropdown when clicking outside
    this.handleOutsideClick = this.handleOutsideClick.bind(this)
    document.addEventListener('click', this.handleOutsideClick)
  }

  disconnect() {
    document.removeEventListener('click', this.handleOutsideClick)
  }

  toggle(event) {
    event.stopPropagation()
    this.isOpen = !this.isOpen
    this.updateMenu()
  }

  close() {
    this.isOpen = false
    this.updateMenu()
  }

  updateMenu() {
    if (this.hasMenuTarget) {
      if (this.isOpen) {
        this.menuTarget.classList.remove('hidden')
        this.menuTarget.classList.add('block')
      } else {
        this.menuTarget.classList.add('hidden')
        this.menuTarget.classList.remove('block')
      }
    }
  }

  handleOutsideClick(event) {
    if (!this.element.contains(event.target)) {
      this.close()
    }
  }
}
