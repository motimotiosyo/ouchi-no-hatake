# frozen_string_literal: true

# Rack::Attack configuration for rate limiting
# https://github.com/rack/rack-attack

class Rack::Attack
  # Disable in development environment
  Rack::Attack.enabled = !Rails.env.development?

  # Throttle login attempts by email address
  # Allow 5 requests per minute per email
  throttle("login/email", limit: 5, period: 60) do |req|
    if req.path == "/api/v1/login" && req.post?
      # Return the email from request body for tracking
      req.params["email"].presence
    end
  end

  # Custom response for throttled requests
  self.throttled_responder = lambda do |env|
    retry_after = env["rack.attack.match_data"][:period]
    [
      429,
      {
        "Content-Type" => "application/json",
        "Retry-After" => retry_after.to_s
      },
      [ { error: "Too many requests. Please try again later." }.to_json ]
    ]
  end
end
