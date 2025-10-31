class OauthService < ApplicationService
  class AuthenticationError < StandardError; end

  # Google OAuth認証を処理
  def self.authenticate_google(credential)
    # Google ID Tokenを検証・デコード
    auth_info = decode_google_token(credential)

    # ユーザーを取得または作成
    user = find_or_create_user(auth_info)

    # JWT発行
    token = generate_jwt(user)

    {
      user: user,
      token: token
    }
  rescue StandardError => e
    raise AuthenticationError, "OAuth authentication failed: #{e.message}"
  end

  private

  def self.decode_google_token(credential)
    require "net/http"
    require "json"

    # Google Token Info APIを使用してトークンを検証
    uri = URI("https://oauth2.googleapis.com/tokeninfo?id_token=#{credential}")
    response = Net::HTTP.get_response(uri)

    raise AuthenticationError, "Invalid token" unless response.is_a?(Net::HTTPSuccess)

    token_info = JSON.parse(response.body)

    # トークンが正しいクライアントIDのものか確認
    unless token_info["aud"] == ENV["GOOGLE_CLIENT_ID"]
      raise AuthenticationError, "Invalid client ID"
    end

    {
      provider: "google",
      uid: token_info["sub"],
      email: token_info["email"],
      name: token_info["name"],
      email_verified: token_info["email_verified"] == "true"
    }
  end

  def self.find_or_create_user(auth_info)
    # 既存のOAuth連携を検索
    provider = UserProvider.find_by(
      provider: auth_info[:provider],
      uid: auth_info[:uid]
    )

    if provider
      # 既存のOAuthユーザー
      return provider.user
    end

    # メールアドレスで既存ユーザーを検索
    user = User.find_by(email: auth_info[:email])

    if user
      # 既存ユーザーにOAuth連携を追加
      user.user_providers.create!(
        provider: auth_info[:provider],
        uid: auth_info[:uid],
        email: auth_info[:email]
      )
      return user
    end

    # 新規ユーザー作成
    User.transaction do
      user = User.create!(
        email: auth_info[:email],
        name: auth_info[:name],
        password_digest: nil, # OAuthユーザーはパスワード不要
        email_verified: auth_info[:email_verified]
      )

      user.user_providers.create!(
        provider: auth_info[:provider],
        uid: auth_info[:uid],
        email: auth_info[:email]
      )

      user
    end
  end

  def self.generate_jwt(user)
    payload = {
      user_id: user.id,
      exp: 24.hours.from_now.to_i
    }

    JWT.encode(payload, Rails.application.credentials.secret_key_base)
  end
end
