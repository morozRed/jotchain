# frozen_string_literal: true

class ProjectPerson < ApplicationRecord
  self.table_name = "project_persons"

  belongs_to :project
  belongs_to :person

  validates :project_id, uniqueness: {scope: :person_id}
end
