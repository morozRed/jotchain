class StripeWebhooksController < ApplicationController
  skip_before_action :verify_authenticity_token
  skip_before_action :authenticate_user!

  def create
    payload = request.body.read
    sig_header = request.env['HTTP_STRIPE_SIGNATURE']
    endpoint_secret = Rails.configuration.stripe[:webhook_secret]

    begin
      event = Stripe::Webhook.construct_event(
        payload, sig_header, endpoint_secret
      )
    rescue JSON::ParserError => e
      render json: { error: 'Invalid payload' }, status: :bad_request
      return
    rescue Stripe::SignatureVerificationError => e
      Rails.logger.error "Stripe webhook signature verification failed: #{e.message}"
      render json: { error: 'Invalid signature' }, status: :bad_request
      return
    end

    # Handle the event
    case event.type
    when 'checkout.session.completed'
      StripeService.handle_checkout_completed(event)
    when 'customer.subscription.created'
      StripeService.handle_subscription_created(event)
    when 'customer.subscription.updated'
      StripeService.handle_subscription_updated(event)
    when 'customer.subscription.deleted'
      StripeService.handle_subscription_deleted(event)
    when 'invoice.payment_succeeded'
      handle_payment_succeeded(event)
    when 'invoice.payment_failed'
      handle_payment_failed(event)
    else
      Rails.logger.info "Unhandled Stripe event type: #{event.type}"
    end

    render json: { message: 'Success' }, status: :ok
  rescue StandardError => e
    Rails.logger.error "Stripe webhook error: #{e.message}"
    Rails.logger.error e.backtrace.join("\n")
    render json: { error: 'Webhook handler failed' }, status: :internal_server_error
  end

  private

  def handle_payment_succeeded(event)
    invoice = event.data.object
    return unless invoice.subscription

    subscription = Subscription.find_by(stripe_subscription_id: invoice.subscription)
    return unless subscription

    Rails.logger.info "Payment succeeded for subscription #{subscription.id}"

    # Update subscription status if it was past_due
    if subscription.status == 'past_due'
      subscription.update!(status: 'active')
    end
  end

  def handle_payment_failed(event)
    invoice = event.data.object
    return unless invoice.subscription

    subscription = Subscription.find_by(stripe_subscription_id: invoice.subscription)
    return unless subscription

    Rails.logger.warn "Payment failed for subscription #{subscription.id}"

    # You might want to send an email to the user here
    # UserMailer.payment_failed(subscription.user).deliver_later
  end
end