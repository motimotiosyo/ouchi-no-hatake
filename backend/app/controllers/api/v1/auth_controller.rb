class Api::V1::AuthController < ApplicationController
  include ActionController::Cookies
  skip_before_action :authenticate_request, only: [ :register, :login, :verify, :logout ]

  # POST /api/v1/auth/register
  def register
    user = User.create!(user_params)
    token = JsonWebToken.encode(user_id: user.id)

    render json: {
      message: "ユーザー登録が完了しました",
      token: token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    }, status: :created
  end

  # POST /api/v1/auth/login
  def login
    # アドレスでユーザー検索
    user = User.find_by(email: params[:email]&.downcase)

    # パスワード検証
    if user&.authenticate(params[:password])
      # 認証成功時にJWTトークン発行
      token = JsonWebToken.encode(user_id: user.id)
      # サーバーサイドでCookieをセット
      cookies[:auth_token] = {
        value: token,
        expires: 7.days.from_now,
        path: "/",
        same_site: :none,   # ← クロスオリジンの場合は :none
        secure: true,       # ← https環境なら true、ローカルhttpなら false
        httponly: false
      }
      # 成功レスポンス返却
      render json: {
        message: "ログインに成功しました",
        token: token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name
        }
      }, status: :ok
    else
      # 失敗時に例外処理
      raise ExceptionHandler::AuthenticationError, "メールアドレスまたはパスワードが正しくありません"
    end
  end

  # DELETE /api/v1/auth/logout
  def logout
    token = current_token

    if token.blank?
      render json: { error: "No token provided" }, status: :bad_request
      return
    end

    # サーバーサイドでCookie削除（複数パターンで確実に削除）
    cookies.delete(:auth_token, {
      path: "/",
      same_site: :none,
      secure: true
    })

    # 念のため、属性なしでも削除
    cookies.delete(:auth_token, { path: "/" })
    cookies.delete(:auth_token)

    blacklist_result = JsonWebToken.blacklist_token(token)
    
    # ブラックリスト処理が成功した場合、または期限切れトークンの場合は成功
    if blacklist_result
      render json: { message: "ログアウトに成功しました" }, status: :ok
    else
      # 期限切れトークンの場合もログアウト成功として扱う
      Rails.logger.info "Token already expired or invalid, treating as successful logout"
      render json: { message: "ログアウトに成功しました" }, status: :ok
    end
  rescue StandardError => e
    Rails.logger.error "Logout error: #{e.message}"
    render json: { error: "ログアウトに失敗しました" }, status: :internal_server_error
  end

  def verify
    # Cookieからトークンを取得
    token = cookies[:auth_token] || request.headers["Authorization"]&.split(" ")&.last
    if token && JsonWebToken.valid_token?(token)
      render json: { valid: true }
    else
      render json: { valid: false }, status: :unauthorized
    end
  end

  private

  def user_params
    params.require(:user).permit(:email, :password, :password_confirmation, :name)
  end
end
