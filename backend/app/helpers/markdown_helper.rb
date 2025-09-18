module MarkdownHelper
  def render_markdown(text)
    return "" if text.blank?

    # Basic markdown to HTML conversion
    html = text.to_s.dup

    # Headers
    html.gsub!(/^### (.+)$/m, '<h3 class="text-lg font-semibold mb-2">\1</h3>')
    html.gsub!(/^## (.+)$/m, '<h2 class="text-xl font-semibold mb-2">\1</h2>')
    html.gsub!(/^# (.+)$/m, '<h1 class="text-2xl font-semibold mb-3">\1</h1>')

    # Bold and italic
    html.gsub!(/\*\*(.+?)\*\*/m, '<strong>\1</strong>')
    html.gsub!(/\*(.+?)\*/m, '<em>\1</em>')

    # Lists
    html.gsub!(/^\* (.+)$/m, '<li class="ml-4 list-disc">\1</li>')
    html.gsub!(/^- (.+)$/m, '<li class="ml-4 list-disc">\1</li>')
    html.gsub!(/(<li.*?<\/li>\n?)+/m) do |list_items|
      "<ul class=\"mb-2\">#{list_items}</ul>"
    end

    # Code blocks
    html.gsub!(/```(.+?)```/m, '<pre class="bg-gray-100 p-2 rounded overflow-x-auto mb-2"><code>\1</code></pre>')
    html.gsub!(/`(.+?)`/, '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm">\1</code>')

    # Line breaks and paragraphs
    # First convert double newlines to paragraph breaks
    html.gsub!(/\n\n+/, '</p><p class="mb-2">')
    # Then convert single newlines to line breaks
    html.gsub!(/\n/, '<br>')
    html = "<p class=\"mb-2\">#{html}</p>" unless html.start_with?('<')

    # Links
    html.gsub!(/\[(.+?)\]\((.+?)\)/, '<a href="\2" class="text-accent hover:text-accent-hover underline">\1</a>')

    # Sanitize and return
    sanitize(html, tags: %w[p br strong em ul ol li h1 h2 h3 h4 h5 h6 code pre a blockquote],
             attributes: %w[href class])
  end

  def markdown_preview(text, length: 200)
    return "" if text.blank?

    # Strip markdown formatting for preview
    preview = text.to_s.dup
    preview.gsub!(/[#*`\[\]()]+/, '')
    preview = truncate(preview, length: length, omission: '...')

    simple_format(preview, class: 'text-sm text-text-secondary')
  end
end