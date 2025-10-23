# frozen_string_literal: true

class Entry < ApplicationRecord
  MAX_BODY_LENGTH = 10_000

  belongs_to :user

  validates :body, presence: true, length: {maximum: MAX_BODY_LENGTH}
  validates :logged_at, presence: true
  validates :tag, length: {maximum: 120}, allow_blank: true

  scope :recent_first, -> { order(logged_at: :desc, created_at: :desc) }
  scope :for_period, ->(range) { where(logged_at: range) }

  before_validation :default_logged_at

  private

  def default_logged_at
    self.logged_at ||= Time.current
  end
end
