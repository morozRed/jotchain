# CORS configuration (uses rack-cors if available)
if defined?(Rack::Cors)
  Rails.application.config.middleware.insert_before 0, Rack::Cors do
    allow do
      origins ENV.fetch("FRONTEND_ORIGIN", "*")
      resource "*",
        headers: :any,
        methods: %i[get post put patch delete options head],
        credentials: true
    end
  end
end

