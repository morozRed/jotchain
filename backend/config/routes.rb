# frozen_string_literal: true

Rails.application.routes.draw do
  scope constraints: { subdomain: /jobs/ } do
    mount MissionControl::Jobs::Engine => "/"
  end

  scope constraints: { subdomain: /app/ } do
    get  "sign_in", to: "sessions#new", as: :sign_in
    post "sign_in", to: "sessions#create"
    get  "sign_up", to: "users#new", as: :sign_up
    post "sign_up", to: "users#create"

    resources :sessions, only: [:destroy]
    resource :users, only: [:destroy]

    namespace :identity do
      resource :email_verification, only: [:show, :create]
      resource :password_reset,     only: [:new, :edit, :create, :update]
    end

    get :dashboard, to: "dashboard#index"

    resources :notifications, only: [:index, :create, :update, :destroy]

    get "billing", to: "subscriptions#index", as: :billing
    post "billing/checkout", to: "subscriptions#create_checkout_session", as: :billing_checkout
    get "billing/success", to: "subscriptions#success", as: :billing_success
    post "billing/portal", to: "subscriptions#customer_portal", as: :billing_portal
    post "billing/cancel", to: "subscriptions#cancel", as: :billing_cancel
    post "billing/reactivate", to: "subscriptions#reactivate", as: :billing_reactivate
    post "billing/switch", to: "subscriptions#switch_plan", as: :billing_switch

    namespace :webhooks do
      post "stripe", to: "stripe#create"
    end

    namespace :settings do
      resource :profile, only: [:show, :update]
      resource :password, only: [:show, :update]
      resource :email, only: [:show, :update]
      resources :sessions, only: [:index]
      inertia :appearance
    end

    resources :entries, only: [:create, :update, :destroy]
    resources :feedback, only: [:create]

    root "dashboard#index"
  end

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # Render dynamic PWA files from app/views/pwa/* (remember to link manifest in application.html.erb)
  # get "manifest" => "rails/pwa#manifest", as: :pwa_manifest
  # get "service-worker" => "rails/pwa#service_worker", as: :pwa_service_worker
end
