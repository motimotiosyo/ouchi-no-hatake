# frozen_string_literal: true

# Rack::Attack configuration for rate limiting
# https://github.com/rack/rack-attack

class Rack::Attack
  # Configure cache store
  # Use Redis in production for distributed rate limiting
  Rack::Attack.cache.store = if Rails.env.production?
    ActiveSupport::Cache::RedisCacheStore.new(url: ENV.fetch("REDIS_URL", "redis://redis:6379/1"))
  else
    ActiveSupport::Cache::MemoryStore.new
  end

  # Disable in development environment
  Rack::Attack.enabled = !Rails.env.development?

  # Throttle login attempts by IP address
  # Allow 5 requests per minute per IP
  throttle("login/ip", limit: 5, period: 60) do |req|
    if req.path == "/api/v1/auth/login" && req.post?
      # Track by IP address
      req.ip
    end
  end

  # Custom response for throttled requests
  self.throttled_responder = lambda do |request|
    [
      429,
      { "Content-Type" => "application/json" },
      [ { error: "Too many requests. Please try again later." }.to_json ]
    ]
  end
end
