# frozen_string_literal: true

module PreviewData
  SAMPLE_PASSWORD = "PreviewPassword123!".freeze

  private

  def preview_user
    User.find_or_create_by!(email: "jordan.preview@example.com") do |user|
      user.name = "Jordan Preview"
      user.password = SAMPLE_PASSWORD
      user.password_confirmation = SAMPLE_PASSWORD
      user.verified = true
    end
  end
end
