class BillingController < ApplicationController
  before_action :authenticate_user!

  def show
    @subscription = current_user.subscription || current_user.build_subscription
    @current_usage = current_user.ai_usage_this_month
  end

  def checkout
    price_id = params[:price_id]
    plan_type = params[:plan_type]

    unless valid_price_id?(price_id)
      redirect_to billing_path, alert: 'Invalid plan selected'
      return
    end

    begin
      session = StripeService.create_checkout_session(
        current_user,
        price_id,
        billing_success_url,
        billing_cancel_url
      )

      redirect_to session.url, allow_other_host: true, status: :see_other
    rescue Stripe::StripeError => e
      redirect_to billing_path, alert: "Unable to create checkout session: #{e.message}"
    end
  end

  def success
    flash[:notice] = 'Your subscription has been successfully activated! Your account will be updated shortly.'
    redirect_to billing_path
  end

  def cancel
    flash[:alert] = 'Subscription checkout was cancelled.'
    redirect_to billing_path
  end

  def portal
    begin
      session = StripeService.create_portal_session(
        current_user,
        billing_url
      )

      redirect_to session.url, allow_other_host: true, status: :see_other
    rescue Stripe::StripeError => e
      redirect_to billing_path, alert: "Unable to access billing portal: #{e.message}"
    end
  end

  def cancel_subscription
    begin
      StripeService.cancel_subscription(current_user)
      flash[:notice] = 'Your subscription has been set to cancel at the end of the current billing period.'
    rescue Stripe::StripeError => e
      flash[:alert] = "Unable to cancel subscription: #{e.message}"
    end

    redirect_to billing_path
  end

  def reactivate_subscription
    begin
      StripeService.reactivate_subscription(current_user)
      flash[:notice] = 'Your subscription has been reactivated.'
    rescue Stripe::StripeError => e
      flash[:alert] = "Unable to reactivate subscription: #{e.message}"
    end

    redirect_to billing_path
  end

  private

  def valid_price_id?(price_id)
    valid_ids = [
      Rails.configuration.stripe[:price_ids][:monthly],
      Rails.configuration.stripe[:price_ids][:yearly]
    ]
    valid_ids.include?(price_id)
  end

  def billing_url
    url_for(action: :show, only_path: false)
  end

  def billing_success_url
    url_for(action: :success, only_path: false)
  end

  def billing_cancel_url
    url_for(action: :cancel, only_path: false)
  end
end