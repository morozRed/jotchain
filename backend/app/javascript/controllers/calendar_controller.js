import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["monthYear", "calendarGrid", "selectedEntry"]
  static values = {
    currentDate: String,
    selectedDate: String,
    streakData: Array
  }

  connect() {
    this.currentDate = new Date()
    this.selectedDate = new Date().toISOString().split('T')[0]
    this.viewDate = new Date()
    this.generateCalendar()
  }

  previousMonth() {
    this.viewDate.setMonth(this.viewDate.getMonth() - 1)
    this.updateMonthYear()
    this.generateCalendar()
  }

  nextMonth() {
    this.viewDate.setMonth(this.viewDate.getMonth() + 1)
    this.updateMonthYear()
    this.generateCalendar()
  }

  selectDate(event) {
    const dateStr = event.currentTarget.dataset.date
    if (!dateStr) return

    // Update selected date
    this.selectedDate = dateStr
    
    // Update visual selection
    this.updateSelectedDay()
    
    // Load entry for selected date
    this.loadEntryForDate(dateStr)
  }

  updateMonthYear() {
    if (this.hasMonthYearTarget) {
      this.monthYearTarget.textContent = this.viewDate.toLocaleDateString('en-US', { 
        month: 'long', 
        year: 'numeric' 
      })
    }
  }

  generateCalendar() {
    if (!this.hasCalendarGridTarget) return

    const year = this.viewDate.getFullYear()
    const month = this.viewDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())

    let html = '<div class="grid grid-cols-7 gap-1">'
    
    // Day headers
    const dayHeaders = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
    dayHeaders.forEach(day => {
      html += `<div class="text-xs text-center p-1 text-muted-foreground font-mono">${day}</div>`
    })

    // Calendar days
    const today = new Date().toISOString().split('T')[0]
    for (let i = 0; i < 42; i++) {
      const currentDate = new Date(startDate)
      currentDate.setDate(startDate.getDate() + i)
      
      const dateStr = currentDate.toISOString().split('T')[0]
      const isCurrentMonth = currentDate.getMonth() === month
      const isToday = currentDate.toDateString() === new Date().toDateString()
      const isSelected = dateStr === this.selectedDate
      const intensity = this.getIntensityForDate(dateStr)

      let classes = 'w-8 h-8 text-xs rounded-sm border transition-colors cursor-pointer hover:border-primary/50 '

      if (!isCurrentMonth) {
        classes += 'text-muted-foreground opacity-50 '
      } else {
        classes += 'text-foreground '
      }

      if (isToday) {
        classes += 'ring-2 ring-primary ring-offset-2 ring-offset-background '
      }

      if (isSelected) {
        classes += 'bg-primary text-primary-foreground '
      } else {
        classes += this.getIntensityClass(intensity)
      }

      html += `<button 
        class="${classes}" 
        data-action="click->calendar#selectDate" 
        data-date="${dateStr}"
        ${!isCurrentMonth ? 'disabled' : ''}
      >
        ${currentDate.getDate()}
      </button>`
    }

    html += '</div>'
    this.calendarGridTarget.innerHTML = html
  }

  updateSelectedDay() {
    // Remove previous selection
    this.calendarGridTarget.querySelectorAll('button').forEach(btn => {
      btn.classList.remove('bg-primary', 'text-primary-foreground')
      const intensity = this.getIntensityForDate(btn.dataset.date)
      const intensityClasses = this.getIntensityClass(intensity).split(' ')
      btn.classList.add(...intensityClasses)
    })

    // Add selection to current date
    const selectedBtn = this.calendarGridTarget.querySelector(`[data-date="${this.selectedDate}"]`)
    if (selectedBtn) {
      // Remove intensity classes
      const intensityClasses = ['bg-muted', 'bg-primary/20', 'bg-primary/40', 'bg-primary/60', 'bg-primary/80', 'bg-primary']
      selectedBtn.classList.remove(...intensityClasses)
      selectedBtn.classList.add('bg-primary', 'text-primary-foreground')
    }
  }

  getIntensityForDate(dateStr) {
    if (!this.streakDataValue) return 0
    const streakDay = this.streakDataValue.find(d => d.date === dateStr)
    return streakDay ? streakDay.intensity : 0
  }

  getIntensityClass(intensity) {
    switch (intensity) {
      case 1: return "bg-primary/20"
      case 2: return "bg-primary/40"
      case 3: return "bg-primary/60"
      case 4: return "bg-primary/80"
      case 5: return "bg-primary"
      default: return "bg-muted"
    }
  }

  loadEntryForDate(dateStr) {
    if (this.hasSelectedEntryTarget) {
      this.selectedEntryTarget.innerHTML = '<div class="text-text-secondary text-sm">Loading...</div>'
    }

    fetch(`/entries/by_date?date=${dateStr}`, {
      headers: {
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      }
    })
    .then(response => response.json())
    .then(data => this.displayEntry(data))
    .catch(error => {
      console.error('Error loading entry:', error)
      if (this.hasSelectedEntryTarget) {
        this.selectedEntryTarget.innerHTML = '<div class="text-error text-sm">Error loading entry</div>'
      }
    })
  }

  displayEntry(entryData) {
    if (this.hasSelectedEntryTarget) {
      this.selectedEntryTarget.innerHTML = entryData.html || '<div class="text-text-secondary text-sm">No entry for this date</div>'
    }
  }
}
