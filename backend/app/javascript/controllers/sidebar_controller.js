import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["spacesMenu", "chevron"]
  static values = {
    storageKey: { type: String, default: "sidebar_spaces_expanded" }
  }

  connect() {
    // Restore expanded state from localStorage
    const isExpanded = localStorage.getItem(this.storageKeyValue) === "true"
    this.setExpanded(isExpanded, false)
  }

  toggle(event) {
    event.preventDefault()
    const isCurrentlyExpanded = this.spacesMenuTarget.classList.contains("expanded")
    this.setExpanded(!isCurrentlyExpanded, true)
  }

  setExpanded(expanded, animate) {
    if (expanded) {
      this.spacesMenuTarget.classList.add("expanded")
      this.spacesMenuTarget.style.maxHeight = this.spacesMenuTarget.scrollHeight + "px"
      this.chevronTarget.style.transform = "rotate(0deg)"
    } else {
      this.spacesMenuTarget.classList.remove("expanded")
      this.spacesMenuTarget.style.maxHeight = "0"
      this.chevronTarget.style.transform = "rotate(-90deg)"
    }

    // Save state to localStorage
    localStorage.setItem(this.storageKeyValue, expanded.toString())
  }
}
