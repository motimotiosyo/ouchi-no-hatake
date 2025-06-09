require "test_helper"

class Api::HealthCheckControllerTest < ActionDispatch::IntegrationTest
  test "should get index" do
    get api_health_check_index_url
    assert_response :success
  end
end
