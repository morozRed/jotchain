import { Controller } from "@hotwired/stimulus"

// Prefill current form with previous entry for context only
export default class extends Controller {
  static targets = ["dayLog", "nextActions", "win"]

  connect() {
    fetch("/entries/previous.json", { headers: { "Accept": "application/json" }})
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data) return
        // Only prefill empty fields to avoid clobbering user input
        if (this.hasDayLogTarget && !this.dayLogTarget.value) this.dayLogTarget.value = data.day_log || ""
        if (this.hasNextActionsTarget && !this.nextActionsTarget.value) this.nextActionsTarget.value = data.next_actions || ""
        if (this.hasWinTarget && !this.winTarget.value) this.winTarget.value = data.win || ""
      })
      .catch(() => {})
  }
}

