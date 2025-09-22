require "test_helper"

class HealthControllerTest < ActionDispatch::IntegrationTest
  test "healthz ok" do
    get "/healthz"
    assert_response :success
    assert_equal "ok", JSON.parse(response.body)["status"]
  end

  test "readyz responds" do
    get "/readyz"
    assert_includes [200, 503], response.status
  end
end

