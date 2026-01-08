# frozen_string_literal: true

module Api
  class GithubReferencesController < Api::BaseController
    def detect
      text = params[:text]
      return render json: { references: [] } if text.blank?

      detector = GithubService::ReferenceDetector.new(workspace: Current.workspace)
      resolved = detector.resolve(text)

      render json: {
        references: resolved.map { |r| format_resolved(r) }
      }
    end

    private

    def format_resolved(resolved)
      ref = resolved[:reference]
      result = {
        type: ref.type.to_s,
        repo: ref.repo,
        identifier: ref.identifier,
        raw: ref.raw
      }

      case ref.type
      when :commit
        commit = resolved[:commit]
        result[:commit] = {
          sha: commit.sha,
          shortSha: commit.short_sha,
          message: commit.message_subject,
          author: commit.author&.login,
          committedAt: commit.committed_at.iso8601,
          url: commit.github_url
        }
      when :pull_request
        pr = resolved[:pull_request]
        result[:pullRequest] = {
          id: pr.id,
          number: pr.number,
          title: pr.title,
          state: pr.state,
          author: pr.author&.login,
          url: pr.github_url
        }
      when :issue
        issue = resolved[:issue]
        result[:issue] = {
          id: issue.id,
          number: issue.number,
          title: issue.title,
          state: issue.state,
          author: issue.author&.login,
          url: issue.github_url
        }
      end

      result
    end
  end
end
