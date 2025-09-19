import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["sidebar", "overlay", "toggleButton", "mainContent", "collapseButton",
                   "calendarSidebar", "calendarToggle", "calendarOverlay"]
  static values = {
    open: Boolean,
    collapsed: Boolean,
    calendarOpen: Boolean
  }

  connect() {
    this.openValue = false
    this.calendarOpenValue = false

    // Load collapsed state from localStorage
    this.collapsedValue = localStorage.getItem('sidebarCollapsed') === 'true'

    // Apply initial state immediately without animation
    this.applyInitialState()

    // Listen for window resize
    this.resizeHandler = this.handleResize.bind(this)
    window.addEventListener('resize', this.resizeHandler)

    // Enable transitions after initial state is applied
    setTimeout(() => {
      if (this.hasSidebarTarget && this.hasMainContentTarget) {
        this.sidebarTarget.classList.add('sidebar-transitions')
        this.mainContentTarget.classList.add('sidebar-transitions')
      }
      // Add transition to collapse button SVG
      if (this.hasCollapseButtonTarget) {
        const svg = this.collapseButtonTarget.querySelector('svg')
        if (svg) {
          svg.classList.add('rotate-transition')
        }
      }
    }, 100)
  }

  disconnect() {
    if (this.resizeHandler) {
      window.removeEventListener('resize', this.resizeHandler)
    }
  }

  toggle() {
    this.openValue = !this.openValue
    this.updateSidebar()
  }

  toggleCollapse() {
    if (window.innerWidth >= 1024) {
      this.collapsedValue = !this.collapsedValue
      localStorage.setItem('sidebarCollapsed', this.collapsedValue)
      this.applyCollapsedState()
    }
  }

  applyInitialState() {
    if (!this.hasSidebarTarget || !this.hasMainContentTarget) return

    const isDesktop = window.innerWidth >= 1024

    if (isDesktop && this.collapsedValue) {
      // Apply collapsed state immediately without animations
      this.sidebarTarget.classList.add('w-20', 'sidebar-collapsed')
      this.sidebarTarget.classList.remove('w-64')
      this.mainContentTarget.classList.add('lg:ml-20')
      this.mainContentTarget.classList.remove('lg:ml-64')

      // Hide text labels immediately
      this.sidebarTarget.querySelectorAll('.sidebar-text').forEach(el => {
        el.classList.add('hidden')
      })

      // Hide chevron in settings link
      this.sidebarTarget.querySelectorAll('.sidebar-chevron').forEach(el => {
        el.classList.add('hidden')
      })

      // Set collapsed logo
      const logo = this.sidebarTarget.querySelector('.sidebar-logo')
      if (logo) {
        logo.innerHTML = '<span class="font-mono font-bold text-xl text-accent">JC</span>'
      }

      // Rotate collapse button without transition
      if (this.hasCollapseButtonTarget) {
        const svg = this.collapseButtonTarget.querySelector('svg')
        if (svg) {
          svg.style.transform = 'rotate(180deg)'
        }
      }
    } else if (isDesktop) {
      // Ensure expanded state on desktop
      this.sidebarTarget.classList.remove('-translate-x-full')
      this.sidebarTarget.classList.add('translate-x-0')
    } else {
      // Mobile - hide sidebar initially
      this.sidebarTarget.classList.add('-translate-x-full')
      this.sidebarTarget.classList.remove('translate-x-0')
    }
  }

  applyCollapsedState() {
    if (!this.hasSidebarTarget || !this.hasMainContentTarget) return

    // Use requestAnimationFrame for smoother transitions
    requestAnimationFrame(() => {
      if (this.collapsedValue) {
        // Collapsed state - narrow sidebar
        this.sidebarTarget.classList.add('w-20', 'sidebar-collapsed')
        this.sidebarTarget.classList.remove('w-64')
        this.mainContentTarget.classList.add('lg:ml-20')
        this.mainContentTarget.classList.remove('lg:ml-64')

        // Hide text labels with a slight delay for smoother animation
        setTimeout(() => {
          this.sidebarTarget.querySelectorAll('.sidebar-text').forEach(el => {
            el.classList.add('hidden')
          })
          // Hide chevron in settings link
          this.sidebarTarget.querySelectorAll('.sidebar-chevron').forEach(el => {
            el.classList.add('hidden')
          })
        }, 100)

        // Adjust logo
        const logo = this.sidebarTarget.querySelector('.sidebar-logo')
        if (logo) {
          logo.innerHTML = '<span class="font-mono font-bold text-xl text-accent">JC</span>'
        }

        // Rotate collapse button with transition (since this is user action)
        if (this.hasCollapseButtonTarget) {
          const svg = this.collapseButtonTarget.querySelector('svg')
          if (svg) {
            svg.style.transform = 'rotate(180deg)'
          }
        }
      } else {
        // Expanded state - normal sidebar
        this.sidebarTarget.classList.remove('w-20', 'sidebar-collapsed')
        this.sidebarTarget.classList.add('w-64')
        this.mainContentTarget.classList.remove('lg:ml-20')
        this.mainContentTarget.classList.add('lg:ml-64')

        // Show text labels immediately
        this.sidebarTarget.querySelectorAll('.sidebar-text').forEach(el => {
          el.classList.remove('hidden')
        })
        // Show chevron in settings link
        this.sidebarTarget.querySelectorAll('.sidebar-chevron').forEach(el => {
          el.classList.remove('hidden')
        })

        // Restore logo
        const logo = this.sidebarTarget.querySelector('.sidebar-logo')
        if (logo) {
          logo.innerHTML = '<span class="font-mono font-bold text-xl"><span class="text-accent">Jot</span>Chain</span>'
        }

        // Reset collapse button rotation with transition
        if (this.hasCollapseButtonTarget) {
          const svg = this.collapseButtonTarget.querySelector('svg')
          if (svg) {
            svg.style.transform = 'rotate(0deg)'
          }
        }
      }
    })
  }

  open() {
    this.openValue = true
    this.updateSidebar()
  }

  close() {
    this.openValue = false
    this.updateSidebar()
  }

  updateSidebar() {
    if (this.hasSidebarTarget) {
      if (this.openValue) {
        // Open sidebar
        this.sidebarTarget.classList.remove('-translate-x-full')
        this.sidebarTarget.classList.add('translate-x-0')

        // Show overlay on mobile
        if (this.hasOverlayTarget && window.innerWidth < 1024) {
          this.overlayTarget.classList.remove('hidden')
          this.overlayTarget.classList.add('block')
        }
      } else {
        // Close sidebar on mobile
        if (window.innerWidth < 1024) {
          this.sidebarTarget.classList.add('-translate-x-full')
          this.sidebarTarget.classList.remove('translate-x-0')
        }

        // Hide overlay
        if (this.hasOverlayTarget) {
          this.overlayTarget.classList.add('hidden')
          this.overlayTarget.classList.remove('block')
        }
      }
    }
  }

  handleResize() {
    const isDesktop = window.innerWidth >= 1024

    // Update calendar sidebar responsive behavior
    this.updateCalendarSidebar()

    if (isDesktop) {
      // Desktop - always show sidebar
      if (this.hasSidebarTarget) {
        this.sidebarTarget.classList.remove('-translate-x-full')
        this.sidebarTarget.classList.add('translate-x-0')
      }
      if (this.hasOverlayTarget) {
        this.overlayTarget.classList.add('hidden')
        this.overlayTarget.classList.remove('block')
      }
      // Apply collapsed state on desktop
      this.applyCollapsedState()
    } else {
      // Mobile - reset to expanded when switching from desktop
      if (this.collapsedValue && this.hasSidebarTarget) {
        // Reset collapsed state for mobile
        this.sidebarTarget.classList.remove('w-20', 'sidebar-collapsed')
        this.sidebarTarget.classList.add('w-64')

        // Show all text labels on mobile
        this.sidebarTarget.querySelectorAll('.sidebar-text').forEach(el => {
          el.classList.remove('hidden')
        })
      }

      // Hide sidebar if not explicitly opened
      if (!this.openValue && this.hasSidebarTarget) {
        this.sidebarTarget.classList.add('-translate-x-full')
        this.sidebarTarget.classList.remove('translate-x-0')
      }
    }
  }

  // Calendar sidebar methods
  toggleCalendar() {
    this.calendarOpenValue = !this.calendarOpenValue
    this.updateCalendarSidebar()
  }

  closeCalendar() {
    this.calendarOpenValue = false
    this.updateCalendarSidebar()
  }

  updateCalendarSidebar() {
    if (this.hasCalendarSidebarTarget) {
      if (this.calendarOpenValue) {
        this.calendarSidebarTarget.classList.remove('translate-x-full')
        this.calendarSidebarTarget.classList.add('translate-x-0')
        this.calendarSidebarTarget.setAttribute('data-sidebar-expanded', 'true')
      } else {
        this.calendarSidebarTarget.classList.add('translate-x-full')
        this.calendarSidebarTarget.classList.remove('translate-x-0')
        this.calendarSidebarTarget.setAttribute('data-sidebar-expanded', 'false')
      }
    }

    if (this.hasCalendarOverlayTarget) {
      if (this.calendarOpenValue && window.innerWidth < 1024) {
        this.calendarOverlayTarget.classList.remove('hidden')
      } else {
        this.calendarOverlayTarget.classList.add('hidden')
      }
    }

    // Adjust main content margin when calendar is open on desktop
    if (this.hasMainContentTarget) {
      if (this.calendarOpenValue && window.innerWidth >= 1024) {
        this.mainContentTarget.classList.add('lg:mr-80')
      } else {
        this.mainContentTarget.classList.remove('lg:mr-80')
      }
    }
  }
}