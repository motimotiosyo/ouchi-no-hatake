class Api::V1::AuthController < ApplicationController
  include ActionController::Cookies
  skip_before_action :authenticate_request, only: [ :register, :login, :verify ]

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
    Rails.logger.info "🚀 ログイン処理開始"
    
    # アドレスでユーザー検索
    user = User.find_by(email: params[:email]&.downcase)
    Rails.logger.info "👤 ユーザー検索結果: #{user&.email || 'なし'}"

    # パスワード検証
    if user&.authenticate(params[:password])
      Rails.logger.info "✅ 認証成功"
      
      # 認証成功時にJWTトークン発行
      token = JsonWebToken.encode(user_id: user.id)
      
      # デバッグログ追加
      Rails.logger.info "🍪 Cookie設定開始: #{Rails.env}"
      
      if Rails.env.production?
        cookie_options = {
          value: token,
          expires: 7.days.from_now,
          path: "/",
          same_site: :none,
          secure: true,
          httponly: false
        }
        Rails.logger.info "🍪 プロダクション Cookie設定: #{cookie_options}"
        cookies[:auth_token] = cookie_options
      else
        # 開発環境用の設定
        cookies[:auth_token] = {
          value: token,
          expires: 7.days.from_now,
          path: "/",
          same_site: :lax,
          secure: false,
          httponly: false
        }
      end
      
      Rails.logger.info "🍪 Cookie設定完了"
      
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
      Rails.logger.info "❌ 認証失敗"
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

    if JsonWebToken.blacklist_token(token)
      render json: { message: "ログアウトに成功しました" }, status: :ok
    else
      render json: { error: "ログアウトに失敗しました" }, status: :internal_server_error
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