# frozen_string_literal: true

# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Example:
#
#   ["Action", "Comedy", "Drama", "Horror"].each do |genre_name|
#     MovieGenre.find_or_create_by!(name: genre_name)
#   end

# Seed user

user = User.find_or_create_by!(email: "moroz.grigory@gmail.com") do |user|
  user.name = "Grigory Moroz"
  user.password = "securepassword"
  user.password_confirmation = "securepassword"
end

# Seed notes

[
  "Fixed a bug in the authentication system that was causing login issues for some users.",
  "Implemented a new feature for user profile management.",
  "Refactored the codebase to improve performance and maintainability.",
  "Conducted code reviews and provided feedback to team members.",
  "Attended a team meeting to discuss project progress and upcoming tasks."
].each do |entry_content|
  Entry.create(
    body: entry_content,
    user: user,
    created_at: rand(1..6).days.ago
  )
end
