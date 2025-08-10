require "test_helper"

class Api::V1::EmailVerificationMiddlewareTest < ActionDispatch::IntegrationTest
  def setup
    @verified_user = User.create!(
      name: "Verified User",
      email: "verified@example.com",
      password: "password123",
      email_verified: true,
      email_verification_token: nil
    )

    @unverified_user = User.create!(
      name: "Unverified User",
      email: "unverified@example.com",
      password: "password123",
      email_verified: false,
      email_verification_token: "test_token"
    )

    @verified_token = JsonWebToken.encode(user_id: @verified_user.id)
    @unverified_token = JsonWebToken.encode(user_id: @unverified_user.id)
  end

  test "メール認証済みユーザーはAPIアクセス可能" do
    post "/api/v1/posts", params: {
      post: { title: "Test Post", content: "Test Content", post_type: "general_post" }
    }, headers: auth_headers(@verified_token)
    assert_response :created
  end

  test "メール未認証ユーザーはAPIアクセス拒否される" do
    post "/api/v1/posts", params: {
      post: { title: "Test Post", content: "Test Content", post_type: "general_post" }
    }, headers: auth_headers(@unverified_token)
    assert_response :forbidden

    response_data = JSON.parse(response.body)
    assert_equal "メールアドレスの認証が完了していません。認証メールをご確認ください", response_data["error"]
    assert_equal true, response_data["requires_verification"]
    assert_equal @unverified_user.email, response_data["email"]
  end

  test "認証関連エンドポイントはメール未認証でもアクセス可能" do
    # 登録
    post "/api/v1/auth/register", params: {
      user: { name: "Test User", email: "test@example.com", password: "password123" }
    }
    assert_response :created

    # メール認証（無効なトークン）
    post "/api/v1/auth/verify-email", params: { token: "invalid_token" }
    # トークンが無効でもエンドポイント自体にはアクセス可能
    assert_response :unprocessable_entity

    # 認証メール再送信
    post "/api/v1/auth/resend-verification", params: { email: @unverified_user.email }
    assert_response :ok
  end

  test "トークンなしの場合は認証エラーが優先される" do
    post "/api/v1/posts", params: {
      post: { title: "Test Post", content: "Test Content", post_type: "general_post" }
    }
    assert_response :unprocessable_entity

    response_data = JSON.parse(response.body)
    assert_equal "トークンが提供されていません", response_data["message"]
  end

  private

  def auth_headers(token)
    { "Authorization" => "Bearer #{token}" }
  end
end
