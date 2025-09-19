Rails.application.routes.draw do
  # Stripe webhooks (no subdomain constraint)
  post '/stripe/webhooks', to: 'stripe_webhooks#create'

  # Application routes (app.jotchain.com or localhost)
  constraints subdomain: /app|^$/ do
    devise_for :users, controllers: {
      registrations: 'users/registrations'
    }

    # Authentication required routes
    authenticated :user do
      root to: "dashboard#index", as: :authenticated_root

      resources :entries do
        collection do
          get :export
          get :by_date
        end
      end

      resource :dashboard, only: [:show], controller: 'dashboard'

      # Billing routes
      resource :billing, only: [:show], controller: 'billing' do
        member do
          post :checkout
          get :success
          get :cancel
          post :portal
          post :cancel_subscription
          post :reactivate_subscription
        end
      end

      resources :streaks, only: [:index]

      resources :feedback, only: [:new, :create]
      resources :insights, only: [:index, :create]
    end

    # Redirect non-authenticated users to sign in
    unauthenticated do
      root to: redirect('/users/sign_in')
    end
  end

  # Health check
  get "up" => "rails/health#show", as: :rails_health_check
end