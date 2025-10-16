class Link < ApplicationRecord
  belongs_to :chain
  has_one :space, through: :chain

  enum :category, {
    note: "note",
    accomplishment: "accomplishment",
    feedback: "feedback",
    risk: "risk",
    insight: "insight",
    update: "update"
  }, suffix: true, prefix: true, validate: true

  enum :sentiment, { neutral: 0, positive: 1, negative: 2 }, prefix: true, default: :neutral

  validates :body, presence: true
  validates :recorded_on, presence: true
  validates :category, inclusion: { in: categories.keys }

  after_initialize :apply_defaults, if: :new_record?
  before_validation :default_recorded_on
  before_validation :normalize_collections

  scope :recent, -> { order(recorded_on: :desc, created_at: :desc) }
  scope :with_category, ->(value) { where(category: value) if value.present? }
  scope :tagged_with, lambda { |tag|
    where("? = ANY (tags)", tag) if tag.present?
  }
  scope :mentioning, lambda { |mention|
    where("? = ANY (mentions)", mention) if mention.present?
  }

  def tag_list=(value)
    self.tags = parse_list(value)
  end

  def tag_list
    tags.join(", ")
  end

  def mention_list=(value)
    self.mentions = parse_list(value)
  end

  def mention_list
    mentions.join(", ")
  end

  def linked_chains
    return Chain.none if linked_chain_ids.blank?

    Chain.where(id: linked_chain_ids)
  end

  def badge_variant
    case category
    when "accomplishment" then "emerald"
    when "feedback" then "blue"
    when "risk" then "rose"
    when "insight" then "violet"
    when "update" then "amber"
    else "slate"
    end
  end

  private

  def parse_list(value)
    Array(value).flat_map { |entry| entry.to_s.split(",") }
               .map { |entry| entry.strip.presence }
               .compact
               .uniq
  end

  def default_recorded_on
    self.recorded_on ||= Date.current
  end

  def apply_defaults
    self.category ||= "note"
    self.sentiment ||= :neutral
  end

  def normalize_collections
    self.tags = parse_list(tags)
    self.mentions = parse_list(mentions)
    self.linked_chain_ids = Array(linked_chain_ids).map(&:presence).compact.map(&:to_i).uniq
  end
end
