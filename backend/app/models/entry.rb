class Entry < ApplicationRecord
  belongs_to :user
  belongs_to :category, optional: true

  # Encrypt at rest using built-in Rails encryption
  encrypts :day_log, :next_actions, :win

  validates :entry_date, presence: true
  validates :entry_date, uniqueness: { scope: [:user_id, :category_id] }

  scope :for_date, ->(date) { where(entry_date: date) }
  scope :recent, -> { order(entry_date: :desc) }
end

