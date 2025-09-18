import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["tab", "panel"]

  connect() {
    this.showTab(0)
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
        tab.classList.add("border-accent", "text-accent")
        tab.classList.remove("border-transparent", "text-text-secondary")
        tab.setAttribute("aria-selected", "true")
        console.log("Activated tab:", i, tab.textContent.trim())
      } else {
        tab.classList.remove("border-accent", "text-accent")
        tab.classList.add("border-transparent", "text-text-secondary")
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