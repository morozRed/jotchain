# frozen_string_literal: true

module Api
  class SignalsController < BaseController
    def index
      presenter = Signals::Presenter.new(user: Current.user)
      render json: presenter.call
    end

    def show
      signal = Current.user.work_signals.find(params[:id])
      render json: signal_payload(signal)
    end

    def update
      signal = Current.user.work_signals.find(params[:id])

      case params[:action_type]
      when "seen"
        signal.seen!
      when "ignore"
        signal.ignore!
      when "acknowledge"
        signal.acknowledge!
      when "resolve"
        signal.resolve!
      when "reactivate"
        signal.update!(status: "active", seen_at: nil)
      else
        return render_error("Invalid action")
      end

      render json: signal_payload(signal)
    end

    def add_entry
      signal = Current.user.work_signals.find(params[:id])
      entry = Current.user.entries.find(params[:entry_id])

      signal_entry = signal.signal_entries.create!(
        entry: entry,
        role: params[:role] || "reflection",
        excerpt: entry.body_text.truncate(200)
      )

      render json: {id: signal_entry.id, role: signal_entry.role}
    rescue ActiveRecord::RecordInvalid => e
      render_error(e.message)
    end

    private

    def signal_payload(signal)
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
        contextPayload: signal.context_payload,
        entries: signal.signal_entries.includes(:entry).by_score.map do |se|
          {
            id: se.entry_id,
            role: se.role,
            excerpt: se.excerpt,
            score: se.score,
            loggedAt: se.entry.logged_at.iso8601,
            bodyText: se.entry.body_text
          }
        end,
        entities: signal.signal_entities.map do |entity|
          {
            entityType: entity.entity_type,
            name: entity.name,
            mentionableId: entity.mentionable_id,
            count: entity.count
          }
        end
      }
    end
  end
end
