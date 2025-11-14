# frozen_string_literal: true

module Datafast
  # Wrapper around DataFast's Payments API.
  #
  # Reference: https://datafa.st/docs/api-create-payment
  class Payments < Base
    MAX_STRING_LENGTH = 255

    class << self
      def create(**kwargs)
        new.create(**kwargs)
      end

      def create!(**kwargs)
        new.create!(**kwargs)
      end
    end

    def create(**kwargs)
      create!(**kwargs)
    rescue Error, ArgumentError => e
      logger.warn("[Datafast::Payments] #{e.message}")
      false
    end

    def create!(
      amount:,
      currency:,
      transaction_id:,
      datafast_visitor_id: nil,
      email: nil,
      name: nil,
      customer_id: nil,
      renewal: nil,
      refunded: nil,
      timestamp: nil
    )
      payload = build_payload(
        amount:,
        currency:,
        transaction_id:,
        datafast_visitor_id:,
        email:,
        name:,
        customer_id:,
        renewal:,
        refunded:,
        timestamp:
      )

      request(method: :post, path: "/payments", body: payload)
    end

    private

    def build_payload(
      amount:,
      currency:,
      transaction_id:,
      datafast_visitor_id:,
      email:,
      name:,
      customer_id:,
      renewal:,
      refunded:,
      timestamp:
    )
      normalized_amount = Float(amount)
      raise ArgumentError, "amount must be greater than or equal to zero" if normalized_amount.negative?

      currency_code = currency.to_s.strip.upcase
      raise ArgumentError, "currency is required" if currency_code.blank?

      txn_id = transaction_id.to_s.strip
      raise ArgumentError, "transaction_id is required" if txn_id.blank?

      payload = {
        amount: normalized_amount,
        currency: currency_code,
        transaction_id: txn_id
      }

      payload[:datafast_visitor_id] = sanitize_string(datafast_visitor_id)
      payload[:email] = sanitize_string(email)
      payload[:name] = sanitize_string(name)
      payload[:customer_id] = sanitize_string(customer_id)
      payload[:renewal] = !!renewal unless renewal.nil?
      payload[:refunded] = !!refunded unless refunded.nil?
      payload[:timestamp] = sanitize_string(timestamp)

      payload.compact
    rescue ArgumentError => e
      raise e
    rescue => e
      raise ArgumentError, e.message
    end

    def sanitize_string(value)
      return if value.blank?

      value.to_s[0, MAX_STRING_LENGTH]
    end
  end
end

