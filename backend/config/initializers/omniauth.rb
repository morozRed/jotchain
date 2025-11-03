# frozen_string_literal: true

Rails.application.config.middleware.use OmniAuth::Builder do
  provider :google_oauth2,
           ENV.fetch("GOOGLE_CLIENT_ID", ''),
           ENV.fetch("GOOGLE_CLIENT_SECRET", ''),
           {
             scope: "email,profile",
             prompt: "select_account",
             image_aspect_ratio: "square",
             image_size: 256
           }
end

# Enable CSRF protection for OmniAuth
OmniAuth.config.allowed_request_methods = [ :post ]
