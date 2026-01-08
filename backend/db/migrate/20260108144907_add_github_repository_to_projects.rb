# frozen_string_literal: true

class AddGithubRepositoryToProjects < ActiveRecord::Migration[8.0]
  def change
    add_reference :projects, :github_repository, type: :uuid, null: true, foreign_key: true
  end
end
