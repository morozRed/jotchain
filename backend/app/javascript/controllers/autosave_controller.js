import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["content", "next_actions", "win_description", "status"]

  connect() {
    this.timeout = null
    this.lastSavedTime = null
    this.setupAutosave()
    this.startTimeUpdater()

    // Show initial status
    if (this.hasStatusTarget) {
      this.updateStatus('Auto-save enabled')
    }
  }

  setupAutosave() {
    if (this.hasContentTarget) {
      this.contentTarget.addEventListener('input', () => this.scheduleAutosave())
    }
    if (this.hasNext_actionsTarget) {
      this.next_actionsTarget.addEventListener('input', () => this.scheduleAutosave())
    }
    if (this.hasWin_descriptionTarget) {
      this.win_descriptionTarget.addEventListener('input', () => this.scheduleAutosave())
    }
  }

  scheduleAutosave() {
    if (this.timeout) {
      clearTimeout(this.timeout)
    }

    this.updateStatus('Saving...')

    this.timeout = setTimeout(() => {
      this.save()
    }, 1000) // Auto-save after 1 second of inactivity
  }

  save() {
    const form = this.element
    const formData = new FormData(form)

    fetch(form.action, {
      method: form.method || 'POST',
      body: formData,
      headers: {
        'X-CSRF-Token': document.querySelector('[name="csrf-token"]').content,
        'Accept': 'text/vnd.turbo-stream.html'
      }
    })
    .then(response => {
      if (response.ok) {
        this.lastSavedTime = new Date()
        this.updateSaveTime()
      } else {
        this.updateStatus('Failed to save')
      }
    })
    .catch(error => {
      this.updateStatus('Failed to save')
    })
  }

  updateStatus(message) {
    if (this.hasStatusTarget) {
      this.statusTarget.textContent = message

      // Add subtle fade animation
      this.statusTarget.style.transition = 'opacity 0.2s ease'
      this.statusTarget.style.opacity = '0'

      setTimeout(() => {
        this.statusTarget.style.opacity = '0.7'
      }, 50)
    }
  }

  formatTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000)

    if (seconds < 2) return 'Just now'
    if (seconds < 60) return `${seconds} seconds ago`
    if (seconds < 120) return 'A minute ago'
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`

    // After an hour, show the actual time
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  updateSaveTime() {
    if (this.lastSavedTime && this.hasStatusTarget) {
      this.updateStatus(`Last updated ${this.formatTimeAgo(this.lastSavedTime)}`)
    }
  }

  startTimeUpdater() {
    // Update the relative time every 10 seconds
    this.timeUpdaterInterval = setInterval(() => {
      if (this.lastSavedTime) {
        this.updateSaveTime()
      }
    }, 10000)
  }

  disconnect() {
    if (this.timeout) {
      clearTimeout(this.timeout)
    }
    if (this.timeUpdaterInterval) {
      clearInterval(this.timeUpdaterInterval)
    }
  }
}