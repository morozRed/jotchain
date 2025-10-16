class Space < ApplicationRecord
  has_many :chains, -> { order(Arel.sql("COALESCE(position, 999), name")) }, dependent: :destroy
  has_many :links, through: :chains

  validates :name, presence: true
  validates :slug, uniqueness: true, allow_nil: true

  before_validation :assign_slug, on: :create

  def primary_color
    color.presence || "#6366F1"
  end

  def recent_links(limit: 10)
    links.order(recorded_on: :desc, created_at: :desc).limit(limit)
  end

  def categories_with_counts
    links.reorder(nil).group(:category).order(Arel.sql("COUNT(*) DESC")).count
  end

  private

  def assign_slug
    return if slug.present?

    candidate = name.to_s.parameterize
    suffix = nil

    while Space.exists?(slug: [candidate, suffix].compact.join("-"))
      suffix = suffix.to_i + 1
    end

    self.slug = [candidate, suffix].compact.join("-")
  end
end
