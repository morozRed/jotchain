# frozen_string_literal: true

class InertiaController < ApplicationController
  inertia_config default_render: true
  inertia_share flash: -> { flash.to_hash },
      auth: {
        user: -> {
          return nil unless Current.user

          user_data = Current.user.as_json(only: %i[id name email verified created_at updated_at])
          user_data[:subscription] = {
            status: Current.user.subscription_status,
            planType: Current.user.plan_type,
            daysLeftInTrial: Current.user.days_left_in_trial,
            trialEndsAt: Current.user.trial_ends_at&.iso8601,
            currentPeriodEnd: Current.user.current_period_end&.iso8601,
            activeSubscription: Current.user.active_subscription?,
            trialActive: Current.user.trial_active?,
            trialExpired: Current.user.trial_expired?,
            cancelAtPeriodEnd: Current.user.cancel_at_period_end
          }
          user_data
        },
        session: -> { Current.session&.as_json(only: %i[id]) }
      }

  private

  def inertia_errors(model, full_messages: true)
    {
      errors: model.errors.to_hash(full_messages).transform_values(&:to_sentence)
    }
  end
end
