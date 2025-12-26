# frozen_string_literal: true

module Signals
  class TypeRegistry
    TYPES = {
      blockers: {
        label: "Blockers",
        sentiment: :negative,
        keywords: %w[waiting blocked stuck delayed on-hold dependency bottleneck impediment],
        description: "Work items that are blocked or waiting on dependencies"
      },
      time_sinks: {
        label: "Time Sinks",
        sentiment: :negative,
        keywords: %w[meetings context-switch interruption overhead admin bureaucracy coordination],
        description: "Activities consuming disproportionate time"
      },
      recurring_issues: {
        label: "Recurring Issues",
        sentiment: :negative,
        keywords: %w[again another same repeatedly still keeps happening every-time once-more],
        description: "Repetitive problems or tasks that indicate systemic issues needing a permanent fix"
      },
      impact: {
        label: "Impact",
        sentiment: :positive,
        keywords: %w[helped unblocked mentored reviewed assisted supported enabled paired],
        description: "Contributions that helped others succeed"
      },
      wins: {
        label: "Wins",
        sentiment: :positive,
        keywords: %w[shipped completed launched fixed solved deployed released merged finished],
        description: "Successfully completed work"
      },
      learnings: {
        label: "Learnings",
        sentiment: :positive,
        keywords: %w[learned realized discovered figured understood insight breakthrough TIL],
        description: "New knowledge or insights gained"
      }
    }.freeze

    class << self
      def all
        TYPES
      end

      def get(type)
        TYPES[type.to_sym] || raise(ArgumentError, "Unknown signal type: #{type}")
      end

      def keywords_for(type)
        get(type)[:keywords]
      end

      def label_for(type)
        get(type)[:label]
      end

      def description_for(type)
        get(type)[:description]
      end

      def sentiment_for(type)
        get(type)[:sentiment]
      end

      def negative_types
        TYPES.select { |_, v| v[:sentiment] == :negative }.keys
      end

      def positive_types
        TYPES.select { |_, v| v[:sentiment] == :positive }.keys
      end

      def all_keywords
        TYPES.values.flat_map { |t| t[:keywords] }
      end

      def type_names
        TYPES.keys.map(&:to_s)
      end
    end
  end
end
