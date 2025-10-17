import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["space", "chain"]
  static values = {
    chains: Object
  }

  connect() {
    this.updateChains()

    this.boundPresetHandler = this.handlePreset.bind(this)
    window.addEventListener('modal:preset', this.boundPresetHandler)
  }

  handlePreset(event) {
    const { modalId, spaceId, chainId } = event.detail || {}
    if (modalId !== 'link_modal') return

    if (spaceId !== undefined && spaceId !== null && this.hasSpaceTarget) {
      this.spaceTarget.value = String(spaceId)
      this.updateChains()

      // If chainId is provided, select it after chains are populated
      if (chainId !== undefined && chainId !== null && this.hasChainTarget) {
        setTimeout(() => {
          this.chainTarget.value = String(chainId)
        }, 10)
      } else if (this.hasChainTarget) {
        this.chainTarget.value = ""
      }
    } else if (this.hasSpaceTarget) {
      this.spaceTarget.value = ""
      this.updateChains()
    }
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

  disconnect() {
    if (this.boundPresetHandler) {
      window.removeEventListener('modal:preset', this.boundPresetHandler)
    }
  }
}
