import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["typeButton", "timeframe", "meetingType", "meetingTypeContainer",
                    "generateButton", "resultsContainer", "resultsTitle", "resultsContent",
                    "loadingState", "errorState", "errorMessage", "copyButton"]

  connect() {
    this.selectedType = null
  }

  selectType(event) {
    const button = event.currentTarget

    // Remove selection from all buttons
    this.typeButtonTargets.forEach(btn => {
      btn.classList.remove('border-accent', 'bg-accent/10')
      btn.classList.add('border-border')
    })

    // Add selection to clicked button
    button.classList.remove('border-border')
    button.classList.add('border-accent', 'bg-accent/10')

    // Store selection
    this.selectedType = button.dataset.type

    // Show/hide meeting type selector
    if (this.selectedType === 'meeting_prep') {
      this.meetingTypeContainerTarget.classList.remove('hidden')
    } else {
      this.meetingTypeContainerTarget.classList.add('hidden')
    }
  }

  async generate() {
    if (!this.selectedType) {
      alert('Please select what you want to generate')
      return
    }

    // Show loading state
    this.resultsContainerTarget.classList.remove('hidden')
    this.loadingStateTarget.classList.remove('hidden')
    this.resultsContentTarget.classList.add('hidden')
    this.errorStateTarget.classList.add('hidden')
    this.generateButtonTarget.disabled = true

    try {
      const params = new URLSearchParams({
        insight_type: this.selectedType,
        timeframe: this.timeframeTarget.value
      })

      if (this.selectedType === 'meeting_prep') {
        params.append('meeting_type', this.meetingTypeTarget.value)
      }

      const response = await fetch('/insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'X-CSRF-Token': document.querySelector('[name="csrf-token"]').content,
          'Accept': 'application/json'
        },
        body: params
      })

      const data = await response.json()

      if (response.ok) {
        this.displayResults(data)
      } else {
        this.showError(data.error || 'Failed to generate insights')
      }
    } catch (error) {
      this.showError('Network error. Please try again.')
    } finally {
      this.loadingStateTarget.classList.add('hidden')
      this.generateButtonTarget.disabled = false
    }
  }

  displayResults(data) {
    this.resultsContentTarget.innerHTML = ''
    this.resultsContentTarget.classList.remove('hidden')

    // Update title based on type
    const titles = {
      tweets: 'X Post Suggestions',
      blog: 'Blog Post Ideas',
      wins_summary: 'Wins Summary',
      meeting_prep: 'Meeting Preparation'
    }
    this.resultsTitleTarget.textContent = titles[this.selectedType] || 'Results'

    // Display based on type
    if (data.tweets) {
      this.displayTweets(data.tweets)
    } else if (data.ideas) {
      this.displayBlogIdeas(data.ideas)
    } else if (data.summary) {
      this.displaySummary(data.summary)
    } else if (data.prep_notes) {
      this.displayMeetingPrep(data.prep_notes)
    }
  }

  displayTweets(tweets) {
    tweets.forEach((tweet, index) => {
      const div = document.createElement('div')
      div.className = 'p-4 bg-background-secondary rounded-lg'
      div.innerHTML = `
        <div class="flex justify-between items-start mb-2">
          <span class="text-xs text-text-tertiary">Post ${index + 1}</span>
          <button onclick="navigator.clipboard.writeText('${tweet.replace(/'/g, "\\'")}'); this.textContent = 'Copied!'; setTimeout(() => this.textContent = 'Copy', 2000)"
                  class="text-xs text-accent hover:text-accent-hover">Copy</button>
        </div>
        <p class="text-text-primary">${tweet}</p>
        <p class="text-xs text-text-tertiary mt-2">${tweet.length} characters</p>
      `
      this.resultsContentTarget.appendChild(div)
    })
  }

  displayBlogIdeas(ideas) {
    ideas.forEach((idea, index) => {
      const div = document.createElement('div')
      div.className = 'p-4 bg-background-secondary rounded-lg'
      div.innerHTML = `
        <h4 class="font-semibold text-text-primary mb-2">${idea.title}</h4>
        <p class="text-sm text-text-secondary">${idea.outline}</p>
      `
      this.resultsContentTarget.appendChild(div)
    })
  }

  displaySummary(summary) {
    const div = document.createElement('div')
    div.className = 'prose prose-gray max-w-none'
    div.innerHTML = summary.replace(/\n/g, '<br>')
    this.resultsContentTarget.appendChild(div)
  }

  displayMeetingPrep(prepNotes) {
    const div = document.createElement('div')
    div.className = 'prose prose-gray max-w-none'
    div.innerHTML = prepNotes.replace(/\n/g, '<br>')
    this.resultsContentTarget.appendChild(div)
  }

  showError(message) {
    this.errorStateTarget.classList.remove('hidden')
    this.errorMessageTarget.textContent = message
  }

  copyAll() {
    const text = this.resultsContentTarget.textContent.trim()
    navigator.clipboard.writeText(text)
    this.copyButtonTarget.textContent = 'Copied!'
    setTimeout(() => {
      this.copyButtonTarget.textContent = 'Copy All'
    }, 2000)
  }
}