class StripeService
  def self.create_customer(user)
    return if user.stripe_customer_id.present?

    customer = Stripe::Customer.create(
      email: user.email,
      metadata: {
        user_id: user.id
      }
    )

    user.update!(stripe_customer_id: customer.id)
    customer
  rescue Stripe::StripeError => e
    Rails.logger.error "Stripe customer creation failed for user #{user.id}: #{e.message}"
    raise
  end

  def self.create_checkout_session(user, price_id, success_url, cancel_url)
    ensure_customer(user)

    Stripe::Checkout::Session.create(
      customer: user.stripe_customer_id,
      line_items: [{
        price: price_id,
        quantity: 1
      }],
      mode: 'subscription',
      success_url: success_url,
      cancel_url: cancel_url,
      allow_promotion_codes: true,
      subscription_data: {
        metadata: {
          user_id: user.id
        }
      }
    )
  rescue Stripe::StripeError => e
    Rails.logger.error "Stripe checkout session creation failed: #{e.message}"
    raise
  end

  def self.create_portal_session(user, return_url)
    ensure_customer(user)

    Stripe::BillingPortal::Session.create(
      customer: user.stripe_customer_id,
      return_url: return_url
    )
  rescue Stripe::StripeError => e
    Rails.logger.error "Stripe portal session creation failed: #{e.message}"
    raise
  end

  def self.handle_subscription_created(event)
    subscription = event.data.object
    user = find_user_from_subscription(subscription)
    return unless user

    user_subscription = user.subscription || user.build_subscription
    update_subscription_from_stripe(user_subscription, subscription)
    user_subscription.save!
  end

  def self.handle_subscription_updated(event)
    subscription = event.data.object
    user = find_user_from_subscription(subscription)
    return unless user

    user_subscription = user.subscription
    return unless user_subscription

    update_subscription_from_stripe(user_subscription, subscription)
    user_subscription.save!
  end

  def self.handle_subscription_deleted(event)
    subscription = event.data.object
    user = find_user_from_subscription(subscription)
    return unless user

    user_subscription = user.subscription
    return unless user_subscription

    user_subscription.update!(
      status: 'canceled',
      canceled_at: Time.current
    )
  end

  def self.handle_checkout_completed(event)
    session = event.data.object

    return unless session.mode == 'subscription'

    user = User.find_by(stripe_customer_id: session.customer)
    return unless user

    # Subscription will be created/updated via subscription webhook
    Rails.logger.info "Checkout completed for user #{user.id}"
  end

  def self.cancel_subscription(user)
    return unless user.subscription&.stripe_subscription_id.present?

    stripe_subscription = Stripe::Subscription.update(
      user.subscription.stripe_subscription_id,
      cancel_at_period_end: true
    )

    user.subscription.update!(
      cancel_at_period_end: true
    )

    stripe_subscription
  rescue Stripe::StripeError => e
    Rails.logger.error "Failed to cancel subscription: #{e.message}"
    raise
  end

  def self.reactivate_subscription(user)
    return unless user.subscription&.stripe_subscription_id.present?
    return unless user.subscription.cancel_at_period_end?

    stripe_subscription = Stripe::Subscription.update(
      user.subscription.stripe_subscription_id,
      cancel_at_period_end: false
    )

    user.subscription.update!(
      cancel_at_period_end: false
    )

    stripe_subscription
  rescue Stripe::StripeError => e
    Rails.logger.error "Failed to reactivate subscription: #{e.message}"
    raise
  end

  private

  def self.ensure_customer(user)
    create_customer(user) unless user.stripe_customer_id.present?
  end

  def self.find_user_from_subscription(stripe_subscription)
    # First try to find by subscription metadata
    if stripe_subscription.metadata['user_id'].present?
      user = User.find_by(id: stripe_subscription.metadata['user_id'])
      return user if user
    end

    # Then try by customer ID
    User.find_by(stripe_customer_id: stripe_subscription.customer)
  end

  def self.update_subscription_from_stripe(subscription, stripe_subscription)
    price = stripe_subscription.items.data.first.price
    plan_name = determine_plan_from_price(price)

    subscription.assign_attributes(
      stripe_subscription_id: stripe_subscription.id,
      stripe_customer_id: stripe_subscription.customer,
      stripe_price_id: price.id,
      status: stripe_subscription.status,
      plan_name: plan_name,
      current_period_start: Time.at(stripe_subscription.current_period_start),
      current_period_end: Time.at(stripe_subscription.current_period_end),
      cancel_at_period_end: stripe_subscription.cancel_at_period_end
    )
  end

  def self.determine_plan_from_price(price)
    # Map price IDs to plan names
    case price.id
    when Rails.configuration.stripe[:price_ids][:monthly]
      'monthly'
    when Rails.configuration.stripe[:price_ids][:yearly]
      'yearly'
    else
      # Fallback based on amount and interval
      if price.recurring.interval == 'year'
        'yearly'
      elsif price.recurring.interval == 'month'
        'monthly'
      else
        'free'
      end
    end
  end
end