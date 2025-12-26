# frozen_string_literal: true

module Signals
  class Presenter
    def initialize(user:)
      @user = user
    end

    def call
      {
        summary: build_summary,
        signals: build_signals_list,
        history: build_history_list,
        counts: build_counts
      }
    end

    private

    attr_reader :user

    # Load all surfaceable signals once, then compute everything in Ruby
    def surfaceable_signals
      @surfaceable_signals ||= user.work_signals
        .surfaceable
        .includes({ signal_entries: :entry }, :signal_entities)
        .recent_first
        .to_a
    end

    def build_summary
      {
        total_active: surfaceable_signals.size,
        unseen_count: surfaceable_signals.count { |s| s.seen_at.nil? },
        negative_count: surfaceable_signals.count(&:negative?),
        positive_count: surfaceable_signals.count(&:positive?)
      }
    end

    def build_counts
      grouped = surfaceable_signals.group_by(&:signal_type)
      WorkSignal::SIGNAL_TYPES.each_with_object({}) do |type, hash|
        hash[type] = grouped[type]&.size || 0
      end
    end

    def build_signals_list
      surfaceable_signals.map { |signal| build_signal_data(signal) }
    end

    def build_history_list
      history_signals.map { |signal| build_signal_data(signal) }
    end

    # Load archived signals from last 30 days
    def history_signals
      @history_signals ||= user.work_signals
        .where(status: %w[acknowledged ignored resolved])
        .where("updated_at >= ?", 30.days.ago)
        .includes({ signal_entries: :entry }, :signal_entities)
        .order(updated_at: :desc)
        .limit(50)
        .to_a
    end

    def build_signal_data(signal)
      {
        id: signal.id,
        signalType: signal.signal_type,
        entityName: signal.entity_name,
        title: signal.title,
        status: signal.status,
        confidence: signal.confidence,
        entryCount: signal.entry_count,
        firstDetectedAt: signal.first_detected_at.iso8601,
        lastDetectedAt: signal.last_detected_at.iso8601,
        seenAt: signal.seen_at&.iso8601,
        isNew: signal.seen_at.nil?,
        sentiment: signal.negative? ? "negative" : "positive",
        label: TypeRegistry.label_for(signal.signal_type),
        entries: signal.signal_entries.sort_by { |se| -se.score.to_f }.first(5).map do |se|
          {
            id: se.entry_id,
            role: se.role,
            excerpt: se.excerpt,
            loggedAt: se.entry&.logged_at&.iso8601
          }
        end,
        entities: signal.signal_entities.map do |entity|
          {
            entityType: entity.entity_type,
            name: entity.name,
            count: entity.count
          }
        end
      }
    end
  end
end
