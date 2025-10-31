# frozen_string_literal: true

module StripeService
  class CustomerService
    def self.find_or_create(user)
      if user.stripe_customer_id.present?
        Stripe::Customer.retrieve(user.stripe_customer_id)
      else
        customer = Stripe::Customer.create(
          email: user.email,
          name: user.name,
          metadata: {
            user_id: user.id
          }
        )

        user.update!(stripe_customer_id: customer.id)
        customer
      end
    end

    def self.retrieve(customer_id)
      Stripe::Customer.retrieve(customer_id)
    end
  end
end
