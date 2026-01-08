# frozen_string_literal: true

Rails.application.routes.draw do
  scope constraints: { subdomain: /jobs/ } do
    mount MissionControl::Jobs::Engine => "/"
  end

  scope constraints: { subdomain: /app/ } do
    get    "sign_in",  to: "sessions#new", as: :sign_in
    post   "sign_in",  to: "sessions#create"
    delete "sign_out", to: "sessions#sign_out", as: :sign_out
    get  "sign_up", to: "users#new", as: :sign_up
    post "sign_up", to: "users#create"

    # OmniAuth routes for Google OAuth
    # POST /auth/google_oauth2 is handled by OmniAuth middleware
    get "auth/:provider/callback", to: "oauth_callbacks#create"
    get "auth/failure", to: "oauth_callbacks#failure"

    # GitHub App routes
    get "github/install", to: "github_app#install", as: :github_install
    get "github/callback", to: "github_app#callback", as: :github_callback
    delete "github/installations/:id", to: "github_app#destroy", as: :github_installation

    resources :sessions, only: [:destroy]
    resource :users, only: [:destroy]

    namespace :identity do
      resource :email_verification, only: [:show, :create]
      resource :password_reset,     only: [:new, :edit, :create, :update]
    end

    get :dashboard, to: "dashboard#index"
    get :log, to: "log#index"

    # Team metrics pages
    get :team, to: "team#index"
    get "team/contributors/:id", to: "team#contributor", as: :team_contributor

    get "billing", to: "subscriptions#index", as: :billing
    post "billing/checkout", to: "subscriptions#create_checkout_session", as: :billing_checkout
    get "billing/success", to: "subscriptions#success", as: :billing_success
    post "billing/portal", to: "subscriptions#customer_portal", as: :billing_portal
    post "billing/cancel", to: "subscriptions#cancel", as: :billing_cancel
    post "billing/reactivate", to: "subscriptions#reactivate", as: :billing_reactivate
    post "billing/switch", to: "subscriptions#switch_plan", as: :billing_switch

    namespace :webhooks do
      post "stripe", to: "stripe#create"
      post "github", to: "github#create"
    end

    namespace :settings do
      resource :profile, only: [:show, :update]
      resource :password, only: [:show, :update]
      resource :email, only: [:show, :update]
      resources :sessions, only: [:index]
      resources :entities, only: [:index]
      resource :integrations, only: [:show]
      inertia :appearance
    end

    resources :entries, only: [:create, :update, :destroy]
    resources :feedback, only: [:create]

    namespace :api do
      resources :projects, only: [:index, :show, :create, :update, :destroy] do
        resources :persons, only: [:create, :destroy], controller: "project_persons"
      end
      resources :persons, only: [:index, :show, :create, :update, :destroy]
      resources :mentions, only: [:index]
      resources :signals, only: [:index, :show, :update] do
        member do
          post :add_entry
        end
      end
      resources :workspaces, only: [:index] do
        member do
          post :switch
        end
      end
    end

    root "dashboard#index"
  end

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # Render dynamic PWA files from app/views/pwa/* (remember to link manifest in application.html.erb)
  get "manifest.json", to: "pwa#manifest", as: :pwa_manifest
  # get "service-worker" => "rails/pwa#service_worker", as: :pwa_service_worker
end
