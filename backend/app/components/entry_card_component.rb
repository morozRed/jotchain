class EntryCardComponent < ViewComponent::Base
  def initialize(entry:, editable: false)
    @entry = entry
    @editable = editable
  end

  private

  attr_reader :entry, :editable

  def formatted_date
    entry.entry_date.strftime("%A, %B %d, %Y")
  end

  def win_badge
    return unless entry.win?

    case entry.win_level
    when 'minor'
      content_tag(:span, 'Minor Win', class: 'win-badge-minor')
    when 'major'
      content_tag(:span, 'Major Win', class: 'win-badge-major')
    when 'career_defining'
      content_tag(:span, 'Career Defining', class: 'win-badge-career')
    end
  end

  def content_lines
    entry.content&.split("\n") || []
  end

  def next_actions_lines
    entry.next_actions&.split("\n") || []
  end
end