# frozen_string_literal: true

class User < ApplicationRecord
  has_secure_password

  generates_token_for :email_verification, expires_in: 2.days do
    email
  end

  generates_token_for :password_reset, expires_in: 20.minutes do
    password_salt.last(10)
  end

  encrypts :name
  encrypts :email, deterministic: true

  has_many :entries, dependent: :destroy
  has_many :notification_schedules, dependent: :destroy
  has_many :sessions, dependent: :destroy
  has_many :notification_deliveries, dependent: :destroy
  has_many :insight_requests, dependent: :destroy
  has_many :projects, dependent: :destroy
  has_many :persons, dependent: :destroy
  has_many :work_signals, dependent: :destroy
  has_many :workspace_memberships, dependent: :destroy
  has_many :workspaces, through: :workspace_memberships
  has_many :owned_workspaces, class_name: "Workspace", foreign_key: :owner_id, dependent: :nullify

  validates :name, presence: true
  validates :email, presence: true, uniqueness: true, format: {with: URI::MailTo::EMAIL_REGEXP}
  validates :password, allow_nil: true, length: {minimum: 12}
  validates :uid, uniqueness: { scope: :provider }, if: -> { provider.present? }

  normalizes :email, with: -> { _1.strip.downcase }

  before_validation if: :email_changed?, on: :update do
    self.verified = false
  end

  after_update if: :password_digest_previously_changed? do
    sessions.where.not(id: Current.session).delete_all
  end

  after_create :create_personal_workspace

  def current_streak
    return 0 if entries.empty?

    # Get all unique dates with entries, sorted descending
    entry_dates = entries
      .pluck(:logged_at)
      .map { |dt| dt.in_time_zone(Time.zone).to_date }
      .uniq
      .sort
      .reverse

    return 0 if entry_dates.empty?

    today = Time.current.in_time_zone(Time.zone).to_date

    # If the most recent entry is not today or yesterday, streak is 0
    return 0 unless [today, today - 1.day].include?(entry_dates.first)

    # Count consecutive days backward from the most recent entry
    streak = 0
    current_date = entry_dates.first

    entry_dates.each do |date|
      if date == current_date
        streak += 1
        current_date -= 1.day
      else
        break
      end
    end

    streak
  end

  # Subscription helper methods
  def active_subscription?
    subscription_status == "active"
  end

  def trial_active?
    subscription_status == "trialing" && trial_ends_at.present? && trial_ends_at > Time.current
  end

  def trial_expired?
    subscription_status == "trialing" && trial_ends_at.present? && trial_ends_at <= Time.current
  end

  def days_left_in_trial
    return 0 unless trial_active?
    ((trial_ends_at - Time.current) / 1.day).ceil
  end

  def subscription_canceling?
    cancel_at_period_end && (active_subscription? || trial_active?)
  end

  def can_receive_notifications?
    active_subscription? || trial_active?
  end

  # Find or create a user from OAuth authentication data
  def self.from_omniauth(auth)
    # Normalize the email for lookup
    normalized_email = auth.info.email.strip.downcase

    # Try to find existing user by provider and uid
    user = find_by(provider: auth.provider, uid: auth.uid)

    # If not found by provider/uid, try to find by email (for account linking)
    user ||= find_by(email: normalized_email)

    if user
      # Update existing user with OAuth data
      user.update(
        provider: auth.provider,
        uid: auth.uid,
        avatar_url: auth.info.image,
        verified: true # OAuth users are auto-verified
      )
    else
      # Create new user from OAuth data
      user = create!(
        name: auth.info.name,
        email: normalized_email,
        provider: auth.provider,
        uid: auth.uid,
        avatar_url: auth.info.image,
        verified: true, # OAuth users are auto-verified
        trial_ends_at: 14.days.from_now, # New users get 14-day trial
        password: SecureRandom.base58(24)
      )
    end

    user
  end

  private

  def create_personal_workspace
    base_slug = email.split("@").first.parameterize
    slug = base_slug
    counter = 1

    while Workspace.exists?(slug: slug)
      slug = "#{base_slug}-#{counter}"
      counter += 1
    end

    workspace = Workspace.create!(
      name: "#{name}'s Workspace",
      slug: slug,
      owner: self
    )

    WorkspaceMembership.create!(
      workspace: workspace,
      user: self,
      role: :owner
    )
  end
end
