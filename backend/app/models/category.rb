class Category < ApplicationRecord
  belongs_to :user
  has_many :entries, dependent: :nullify

  # Encrypt at rest using built-in Rails encryption
  encrypts :name

  validates :name, presence: true
  validates :name, uniqueness: { scope: :user_id }
end

