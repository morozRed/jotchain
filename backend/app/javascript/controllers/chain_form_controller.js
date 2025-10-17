import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["spaceSelect"]

  connect() {
    this.boundPresetHandler = this.handlePreset.bind(this)
    window.addEventListener('modal:preset', this.boundPresetHandler)
  }

  handlePreset(event) {
    const { modalId, spaceId } = event.detail || {}
    if (modalId !== 'chain_modal') return

    if (!this.hasSpaceSelectTarget) return

    if (spaceId !== undefined && spaceId !== null) {
      this.spaceSelectTarget.value = String(spaceId)
    } else {
      this.spaceSelectTarget.value = ""
    }
  }

  disconnect() {
    if (this.boundPresetHandler) {
      window.removeEventListener('modal:preset', this.boundPresetHandler)
    }
  }
}
