module RequestHelpers
  def auth_headers(user)
    token = JsonWebToken.encode(user_id: user.id)
    { "Authorization" => "Bearer #{token}" }
  end

  def json_response
    JSON.parse(response.body, symbolize_names: true)
  end
end

RSpec.configure do |config|
  config.include RequestHelpers, type: :request

  # Set default host for request specs
  config.before(:each, type: :request) do
    host! 'localhost:3000'
  end
end
