class Entry < ApplicationRecord
  belongs_to :user

  # Lockbox encryption for content fields
  has_encrypted :content, :next_actions, :win_description

  # Blind index for encrypted search
  blind_index :content

  # Validations
  validates :entry_date, presence: true
  validates :entry_date, uniqueness: { scope: :user_id }

  # Enums
  enum :win_level, {
    minor: 'minor',
    major: 'major',
    career_defining: 'career_defining'
  }, prefix: true

  # Scopes
  scope :wins, -> { where(is_win: true) }
  scope :recent, -> { order(entry_date: :desc) }
  scope :for_date, ->(date) { where(entry_date: date) }
  scope :date_range, ->(start_date, end_date) { where(entry_date: start_date..end_date) }

  # Methods
  def win?
    is_win?
  end

  def formatted_date
    entry_date.strftime("%B %d, %Y")
  end

  def previous_entry
    user.entries.where("entry_date < ?", entry_date).order(entry_date: :desc).first
  end

  def next_entry
    user.entries.where("entry_date > ?", entry_date).order(entry_date: :asc).first
  end

  def completed_tasks
    return [] if content.blank?
    content.lines.select { |line| line.strip.start_with?("✅") || line.strip.start_with?("- [x]") }
  end

  def pending_tasks
    return [] if next_actions.blank?
    next_actions.lines.map(&:strip).reject(&:blank?)
  end
end