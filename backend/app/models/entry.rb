# frozen_string_literal: true

class Entry < ApplicationRecord
  MAX_BODY_LENGTH = 10_000

  belongs_to :user
  has_many :entry_mentions, dependent: :destroy
  has_many :mentioned_projects, -> { where(entry_mentions: {mentionable_type: "Project"}) }, through: :entry_mentions, source: :mentionable, source_type: "Project"
  has_many :mentioned_persons, -> { where(entry_mentions: {mentionable_type: "Person"}) }, through: :entry_mentions, source: :mentionable, source_type: "Person"

  encrypts :body

  validates :body, presence: true, length: {maximum: MAX_BODY_LENGTH}
  validates :logged_at, presence: true
  validates :tag, length: {maximum: 120}, allow_blank: true
  validates :body_format, inclusion: {in: %w[plain tiptap]}

  scope :recent_first, -> { order(logged_at: :desc, created_at: :desc) }
  scope :for_period, ->(range) { where(logged_at: range) }
  scope :mentioning_project, ->(project) {
    joins(:entry_mentions).where(entry_mentions: {mentionable_type: "Project", mentionable_id: project.id})
  }
  scope :mentioning_person, ->(person) {
    joins(:entry_mentions).where(entry_mentions: {mentionable_type: "Person", mentionable_id: person.id})
  }

  before_validation :default_logged_at
  after_save :sync_mentions

  # Parse body and return plain text for display/AI processing
  def body_text
    case body_format
    when "plain"
      body
    when "tiptap"
      extract_text_from_tiptap
    else
      body
    end
  end

  # Extract mentions from TipTap JSON body
  def extract_mentions_from_body
    return [] unless body_format == "tiptap"

    mentions = []
    begin
      doc = JSON.parse(body)
      traverse_tiptap_nodes(doc) do |node|
        if node["type"] == "mention" && node["attrs"]
          mentions << {
            type: node["attrs"]["type"], # "project" or "person"
            id: node["attrs"]["id"]
          }
        end
      end
    rescue JSON::ParserError
      Rails.logger.error "Failed to parse TipTap JSON for entry #{id}"
    end

    mentions.uniq
  end

  private

  def default_logged_at
    self.logged_at ||= Time.current
  end

  def sync_mentions
    return unless saved_change_to_body? || saved_change_to_body_format?

    mentions = extract_mentions_from_body
    current_mentions = entry_mentions.reload.map { |em| {type: em.mentionable_type.downcase, id: em.mentionable_id} }

    # Normalize for comparison
    mentions_normalized = mentions.map { |m| {type: m[:type] == "project" ? "project" : "person", id: m[:id]} }

    # Remove mentions that are no longer in the body
    entry_mentions.each do |em|
      mention_type = em.mentionable_type.downcase
      unless mentions_normalized.any? { |m| m[:type] == mention_type && m[:id] == em.mentionable_id }
        em.destroy
      end
    end

    # Add new mentions
    mentions.each do |mention|
      mentionable_type = mention[:type] == "project" ? "Project" : "Person"
      mentionable_id = mention[:id]

      next if entry_mentions.exists?(mentionable_type: mentionable_type, mentionable_id: mentionable_id)

      entry_mentions.create(mentionable_type: mentionable_type, mentionable_id: mentionable_id)
    end
  end

  def extract_text_from_tiptap
    begin
      doc = JSON.parse(body)
      texts = []
      traverse_tiptap_nodes(doc) do |node|
        case node["type"]
        when "text"
          texts << node["text"]
        when "mention"
          # Include the visible label for mentions (fallback to id)
          if node["attrs"].is_a?(Hash)
            label = node["attrs"]["label"].presence || node["attrs"]["id"].to_s
            texts << label if label.present?
          end
        end
      end
      texts.join(" ")
    rescue JSON::ParserError
      body
    end
  end

  def traverse_tiptap_nodes(node, &block)
    yield node if node.is_a?(Hash)

    if node.is_a?(Hash) && node["content"].is_a?(Array)
      node["content"].each { |child| traverse_tiptap_nodes(child, &block) }
    end
  end
end
