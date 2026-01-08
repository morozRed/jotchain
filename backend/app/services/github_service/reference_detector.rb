# frozen_string_literal: true

module GithubService
  class ReferenceDetector
    # Patterns for GitHub references
    # Full commit SHA (40 chars) or short SHA (7+ chars)
    COMMIT_SHA_PATTERN = /\b([a-f0-9]{7,40})\b/i

    # PR/Issue references: #123 or owner/repo#123
    PR_REFERENCE_PATTERN = /(?:([a-z0-9](?:[a-z0-9-]*[a-z0-9])?\/[a-z0-9._-]+))?#(\d+)/i

    # GitHub URLs
    GITHUB_URL_PATTERN = %r{https?://github\.com/([^/]+/[^/]+)/(pull|issues?|commit)/([a-f0-9]+|\d+)}i

    Reference = Struct.new(:type, :repo, :identifier, :raw, keyword_init: true)

    def initialize(workspace:)
      @workspace = workspace
      @repositories = workspace.github_repositories.sync_enabled.pluck(:full_name)
    end

    def detect(text)
      return [] if text.blank?

      references = []
      references.concat(detect_urls(text))
      references.concat(detect_pr_references(text))
      references.concat(detect_commit_shas(text))

      references.uniq { |r| [r.type, r.repo, r.identifier] }
    end

    def resolve(text)
      refs = detect(text)
      resolved = []

      refs.each do |ref|
        case ref.type
        when :commit
          commit = find_commit(ref)
          resolved << { reference: ref, commit: commit } if commit
        when :pull_request
          pr = find_pull_request(ref)
          resolved << { reference: ref, pull_request: pr } if pr
        when :issue
          issue = find_issue(ref)
          resolved << { reference: ref, issue: issue } if issue
        end
      end

      resolved
    end

    private

    def detect_urls(text)
      text.scan(GITHUB_URL_PATTERN).filter_map do |match|
        repo, type, identifier = match
        next unless @repositories.include?(repo)

        Reference.new(
          type: url_type_to_reference_type(type),
          repo: repo,
          identifier: identifier,
          raw: match.join("/")
        )
      end
    end

    def detect_pr_references(text)
      text.scan(PR_REFERENCE_PATTERN).filter_map do |match|
        repo, number = match
        repo ||= default_repo
        next unless repo && @repositories.include?(repo)

        Reference.new(
          type: :pull_request,
          repo: repo,
          identifier: number.to_i,
          raw: "#{repo}##{number}"
        )
      end
    end

    def detect_commit_shas(text)
      # Avoid matching SHAs that are already part of URLs
      url_ranges = find_url_ranges(text)

      text.scan(COMMIT_SHA_PATTERN).filter_map do |match|
        sha = match[0]
        next if sha.length < 7

        # Find the position of this SHA in the text
        pos = text.index(sha)
        next if url_ranges.any? { |range| range.cover?(pos) }

        # Try to match against known commits in any repository
        commit = find_commit_by_sha(sha)
        next unless commit

        Reference.new(
          type: :commit,
          repo: commit.github_repository.full_name,
          identifier: sha,
          raw: sha
        )
      end
    end

    def find_url_ranges(text)
      ranges = []
      text.scan(GITHUB_URL_PATTERN) do
        ranges << (Regexp.last_match.begin(0)..Regexp.last_match.end(0))
      end
      ranges
    end

    def url_type_to_reference_type(type)
      case type.downcase
      when "pull" then :pull_request
      when "issue", "issues" then :issue
      when "commit" then :commit
      else :unknown
      end
    end

    def default_repo
      @repositories.first
    end

    def find_commit(ref)
      repository = @workspace.github_repositories.find_by(full_name: ref.repo)
      return nil unless repository

      repository.github_commits.where("sha LIKE ?", "#{ref.identifier}%").first
    end

    def find_commit_by_sha(sha)
      @workspace.github_repositories
        .sync_enabled
        .joins(:github_commits)
        .where("github_commits.sha LIKE ?", "#{sha}%")
        .includes(github_commits: :github_repository)
        .first
        &.github_commits
        &.find { |c| c.sha.start_with?(sha) }
    end

    def find_pull_request(ref)
      repository = @workspace.github_repositories.find_by(full_name: ref.repo)
      return nil unless repository

      repository.github_pull_requests.find_by(number: ref.identifier)
    end

    def find_issue(ref)
      repository = @workspace.github_repositories.find_by(full_name: ref.repo)
      return nil unless repository

      repository.github_issues.find_by(number: ref.identifier)
    end
  end
end
