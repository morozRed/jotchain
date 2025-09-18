Rails.application.routes.draw do
  # Application routes (app.jotchain.com or localhost)
  constraints subdomain: /app|^$/ do
    devise_for :users

    # Authentication required routes
    authenticated :user do
      root to: "dashboard#index", as: :authenticated_root

      resources :entries do
        member do
          patch :toggle_win
        end
      end

      resource :dashboard, only: [:show], controller: 'dashboard'

      resources :wins, only: [:index] do
        collection do
          get :export
        end
      end

      resources :streaks, only: [:index]
    end

    # Redirect non-authenticated users to sign in
    unauthenticated do
      root to: redirect('/users/sign_in')
    end
  end

  # Health check
  get "up" => "rails/health#show", as: :rails_health_check
end