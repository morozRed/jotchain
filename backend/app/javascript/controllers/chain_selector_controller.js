import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["space", "chain"]
  static values = {
    chains: Object
  }

  connect() {
    this.updateChains()
  }

  updateChains() {
    const spaceId = this.spaceTarget.value
    const chainSelect = this.chainTarget

    // Clear current options
    chainSelect.innerHTML = '<option value="">Select a chain</option>'

    if (!spaceId) {
      chainSelect.disabled = true
      return
    }

    // Get chains for selected space
    const chains = this.chainsValue[spaceId] || []

    if (chains.length === 0) {
      chainSelect.innerHTML = '<option value="">No chains in this space</option>'
      chainSelect.disabled = true
      return
    }

    // Add chain options
    chains.forEach(chain => {
      const option = document.createElement('option')
      option.value = chain.id
      option.textContent = chain.name
      chainSelect.appendChild(option)
    })

    chainSelect.disabled = false
  }
}
