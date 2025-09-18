import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["input", "editor", "status"]

  connect() {
    // Initialize the Lexxy editor with markdown support
    this.initializeEditor()

    // Setup autosave if needed
    if (this.hasStatusTarget) {
      this.setupAutosave()
    }
  }

  initializeEditor() {
    // Initialize Lexxy on the editor target
    if (this.hasEditorTarget) {
      // Set initial content from hidden input
      if (this.hasInputTarget && this.inputTarget.value) {
        this.editorTarget.innerHTML = this.markdownToHtml(this.inputTarget.value)
      } else {
        // Show placeholder if no content
        const placeholder = this.data.get("placeholder") || "Start typing..."
        this.editorTarget.setAttribute('data-placeholder', placeholder)
        this.editorTarget.classList.add('empty')
      }

      // Listen for changes and update hidden input
      this.editorTarget.addEventListener('input', () => {
        this.handleChange()
      })

      // Make it editable
      this.editorTarget.contentEditable = true
      this.editorTarget.classList.add("lexxy-editor")

      // Add markdown keyboard shortcuts
      this.setupMarkdownShortcuts()
    }
  }

  setupMarkdownShortcuts() {
    this.editorTarget.addEventListener('keydown', (e) => {
      // Bold: Cmd/Ctrl + B
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault()
        this.bold()
      }

      // Italic: Cmd/Ctrl + I
      if ((e.metaKey || e.ctrlKey) && e.key === 'i') {
        e.preventDefault()
        this.italic()
      }

      // Code: Cmd/Ctrl + `
      if ((e.metaKey || e.ctrlKey) && e.key === '`') {
        e.preventDefault()
        this.code()
      }
    })
  }

  // Toolbar actions
  bold() {
    document.execCommand('bold', false, null)
    this.handleChange()
    this.editorTarget.focus()
  }

  italic() {
    document.execCommand('italic', false, null)
    this.handleChange()
    this.editorTarget.focus()
  }

  code() {
    // Wrap selection in code tags
    const selection = window.getSelection()
    if (!selection.rangeCount) return

    const range = selection.getRangeAt(0)
    const selectedText = range.toString()

    if (selectedText) {
      document.execCommand('insertHTML', false, `<code>${selectedText}</code>`)
      this.handleChange()
    }
    this.editorTarget.focus()
  }

  list() {
    document.execCommand('insertUnorderedList', false, null)
    this.handleChange()
    this.editorTarget.focus()
  }

  heading() {
    // Convert current line/selection to h3
    document.execCommand('formatBlock', false, 'h3')
    this.handleChange()
    this.editorTarget.focus()
  }


  handleChange() {
    // Check if editor is empty for placeholder
    const isEmpty = this.editorTarget.textContent.trim() === ''
    if (isEmpty) {
      this.editorTarget.classList.add('empty')
    } else {
      this.editorTarget.classList.remove('empty')
    }

    // Get the markdown content from the editor
    const markdown = this.htmlToMarkdown(this.editorTarget.innerHTML)

    // Update hidden input
    if (this.hasInputTarget) {
      this.inputTarget.value = markdown

      // Trigger input event for autosave
      const event = new Event('input', { bubbles: true })
      this.inputTarget.dispatchEvent(event)
    }
  }

  setupAutosave() {
    this.timeout = null

    this.editorTarget.addEventListener('input', () => {
      if (this.timeout) {
        clearTimeout(this.timeout)
      }

      if (this.hasStatusTarget) {
        this.statusTarget.textContent = 'Saving...'
      }

      this.timeout = setTimeout(() => {
        // Autosave will be triggered by the input event on the hidden field
      }, 1000)
    })
  }

  // Simple markdown conversion helpers
  htmlToMarkdown(html) {
    // This is a simplified version - in production you might want a proper library
    let markdown = html

    // Convert headers
    markdown = markdown.replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n')
    markdown = markdown.replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n')
    markdown = markdown.replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n')

    // Convert bold and italic
    markdown = markdown.replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
    markdown = markdown.replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**')
    markdown = markdown.replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
    markdown = markdown.replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*')

    // Convert lists
    markdown = markdown.replace(/<ul[^>]*>(.*?)<\/ul>/gis, (match, content) => {
      return content.replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n')
    })

    // Convert line breaks and paragraphs
    markdown = markdown.replace(/<br\s*\/?>/gi, '\n')
    markdown = markdown.replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')

    // Remove remaining HTML tags
    markdown = markdown.replace(/<[^>]+>/g, '')

    // Clean up extra whitespace
    markdown = markdown.replace(/\n{3,}/g, '\n\n').trim()

    return markdown
  }

  markdownToHtml(markdown) {
    // This is a simplified version - the actual rendering will be done server-side
    let html = markdown

    // Convert headers
    html = html.replace(/^### (.*?)$/gm, '<h3>$1</h3>')
    html = html.replace(/^## (.*?)$/gm, '<h2>$1</h2>')
    html = html.replace(/^# (.*?)$/gm, '<h1>$1</h1>')

    // Convert bold and italic
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>')

    // Convert lists
    html = html.replace(/^- (.*?)$/gm, '<li>$1</li>')
    html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')

    // Convert paragraphs
    html = html.split('\n\n').map(p => p.trim() ? `<p>${p}</p>` : '').join('')

    return html
  }

  disconnect() {
    if (this.timeout) {
      clearTimeout(this.timeout)
    }
  }
}