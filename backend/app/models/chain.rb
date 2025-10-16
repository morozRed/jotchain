class Chain < ApplicationRecord
  belongs_to :space
  has_many :links, -> { order(recorded_on: :desc, created_at: :desc) }, dependent: :destroy

  enum :status, { active: "active", paused: "paused", archived: "archived" }, default: :active, prefix: true

  validates :name, presence: true
  validates :status, inclusion: { in: statuses.keys }

  before_create :assign_position

  delegate :primary_color, to: :space

  def dominant_tags(limit = 4)
    links.flat_map(&:tags).tally.sort_by { |_tag, count| -count }.first(limit)
  end

  def last_activity_on
    links.pick(:recorded_on)
  end

  def summary_sentence
    return description if description.present?
    return "No notes yet." if links.none?

    "#{links.count} linked notes spanning #{links.distinct.count(:category)} categories."
  end

  private

  def assign_position
    return if position.present?

    self.position = space.chains.maximum(:position).to_i + 1
  end
end
