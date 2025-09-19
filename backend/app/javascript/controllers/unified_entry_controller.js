import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["editor", "contentField", "nextActionsField", "winDescriptionField"]

  connect() {
    this.currentTab = "today"
    this.contents = {
      today: this.contentFieldTarget.value || "",
      next: this.nextActionsFieldTarget.value || "",
      wins: this.winDescriptionFieldTarget.value || ""
    }

    this.placeholders = {
      today: "What did you accomplish today? Describe what you completed, learned, or made progress on...",
      next: "What's next on your agenda? List your priorities and next actions...",
      wins: "What went well? What are you proud of? Any breakthroughs or achievements..."
    }

    if (this.hasEditorTarget) {
      this.setupEditor()
    }
  }

  setupEditor() {
    this.editorTarget.value = this.contents[this.currentTab]
    this.editorTarget.placeholder = this.placeholders[this.currentTab]

    this.editorTarget.addEventListener('input', () => {
      this.saveCurrentContent()
    })

    this.editorTarget.addEventListener('blur', () => {
      this.saveCurrentContent()
    })
  }

  switchTab(event) {
    const tabName = event.currentTarget.dataset.tabName

    if (tabName === this.currentTab) return

    this.saveCurrentContent()

    this.currentTab = tabName
    this.editorTarget.value = this.contents[tabName]
    this.editorTarget.placeholder = this.placeholders[tabName]
  }

  saveCurrentContent() {
    const content = this.editorTarget.value || ""
    this.contents[this.currentTab] = content

    switch(this.currentTab) {
      case "today":
        this.contentFieldTarget.value = content
        break
      case "next":
        this.nextActionsFieldTarget.value = content
        break
      case "wins":
        this.winDescriptionFieldTarget.value = content
        break
    }
  }
}