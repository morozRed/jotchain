import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["tab", "panel"]
  static values = { activeTab: String }

  connect() {
    // Determine which tab should be active initially
    let activeIndex = 0

    if (this.hasActiveTabValue) {
      const tabNames = ['profile', 'password', 'billing', 'danger-zone']
      activeIndex = tabNames.indexOf(this.activeTabValue)
      if (activeIndex === -1) activeIndex = 0
    }

    this.showTab(activeIndex)
  }

  switch(event) {
    event.preventDefault()
    const index = this.tabTargets.indexOf(event.currentTarget)
    this.showTab(index)
  }

  showTab(index) {
    console.log("Showing tab at index:", index)

    this.tabTargets.forEach((tab, i) => {
      if (i === index) {
        // For pill-style buttons (new overlay design)
        tab.classList.add("bg-accent", "text-white", "shadow-sm")
        tab.classList.remove("bg-gray-100", "text-gray-600", "hover:bg-gray-200")
        // For pill-style buttons (old design)
        tab.classList.remove("text-text-secondary")
        // For underline tabs (fallback)
        tab.classList.add("border-accent", "text-accent")
        tab.classList.remove("border-transparent")
        tab.setAttribute("aria-selected", "true")
        console.log("Activated tab:", i, tab.textContent.trim())
      } else {
        // For pill-style buttons (new overlay design)
        tab.classList.remove("bg-accent", "text-white", "shadow-sm")
        tab.classList.add("bg-gray-100", "text-gray-600")
        // For pill-style buttons (old design)
        tab.classList.add("text-text-secondary")
        // For underline tabs (fallback)
        tab.classList.remove("border-accent", "text-accent")
        tab.classList.add("border-transparent")
        tab.setAttribute("aria-selected", "false")
      }
    })

    this.panelTargets.forEach((panel, i) => {
      if (i === index) {
        panel.classList.remove("hidden")
        panel.style.display = "block" // Force display as backup
        console.log("Showing panel:", i, panel.id)
      } else {
        panel.classList.add("hidden")
        panel.style.display = "none" // Force hide as backup
        console.log("Hiding panel:", i, panel.id)
      }
    })
  }
}