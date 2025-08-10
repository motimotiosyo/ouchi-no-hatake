class Api::V1::AuthController < ApplicationController
  include ActionController::Cookies
  skip_before_action :authenticate_request, only: [ :register, :login, :verify, :logout, :verify_email, :resend_verification ]
  skip_before_action :check_email_verification, only: [ :register, :login, :verify, :logout, :verify_email, :resend_verification ]

  # POST /api/v1/auth/register
  def register
    user = User.new(user_params)

    if user.save
      # メール認証トークンを生成
      user.generate_email_verification_token!

      # 認証メール送信
      verification_url = "#{ENV.fetch('FRONTEND_URL', 'http://localhost:3001')}/verify-email?token=#{user.email_verification_token}"
      UserMailer.email_verification(user, verification_url).deliver_now

      render json: {
        message: "ユーザー登録が完了しました。認証メールをご確認ください",
        requires_verification: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name
        }
      }, status: :created
    else
      # セキュリティのため、詳細なエラーは返さず曖昧なメッセージにする
      render json: {
        error: "登録できませんでした。入力内容をご確認ください"
      }, status: :unprocessable_entity
    end
  end

  # POST /api/v1/auth/login
  def login
    # アドレスでユーザー検索
    user = User.find_by(email: params[:email]&.downcase)

    # パスワード検証
    if user&.authenticate(params[:password])
      # メール認証チェック
      unless user.email_verified?
        render json: {
          error: "メールアドレスの認証が完了していません。認証メールをご確認ください",
          requires_verification: true,
          email: user.email
        }, status: :forbidden
        return
      end

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
      render json: { error: "トークンが提供されていません" }, status: :bad_request
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

  # POST /api/v1/auth/verify-email
  def verify_email
    token = params[:token]

    if token.blank?
      render json: { error: "認証トークンが提供されていません" }, status: :bad_request
      return
    end

    # トークンでユーザーを検索
    user = User.find_by(email_verification_token: token)

    if user.nil?
      render json: { error: "無効な認証トークンです" }, status: :unprocessable_entity
      return
    end

    # 期限切れチェック（24時間）
    if user.verification_token_expired?
      render json: {
        error: "認証トークンの有効期限が切れています。再度登録をお試しください",
        expired: true
      }, status: :unprocessable_entity
      return
    end

    # メール認証を完了
    user.verify_email!

    # JWTトークン発行
    jwt_token = JsonWebToken.encode(user_id: user.id)

    render json: {
      message: "メールアドレスの認証が完了しました",
      token: jwt_token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    }, status: :ok
  end

  # POST /api/v1/auth/resend-verification
  def resend_verification
    email = params[:email]

    if email.blank?
      render json: { error: "メールアドレスが提供されていません" }, status: :bad_request
      return
    end

    # メールアドレスでユーザーを検索
    user = User.find_by(email: email.downcase)

    if user.nil?
      render json: { error: "指定されたメールアドレスのユーザーが見つかりません" }, status: :not_found
      return
    end

    # 既に認証済みの場合
    if user.email_verified?
      render json: { error: "このメールアドレスは既に認証済みです" }, status: :unprocessable_entity
      return
    end

    # 新しい認証トークンを生成
    user.generate_email_verification_token!

    # 認証メール再送信
    verification_url = "#{ENV.fetch('FRONTEND_URL', 'http://localhost:3001')}/verify-email?token=#{user.email_verification_token}"
    UserMailer.email_verification(user, verification_url).deliver_now

    render json: {
      message: "認証メールを再送信しました。メールをご確認ください"
    }, status: :ok
  end

  private

  def user_params
    params.require(:user).permit(:email, :password, :password_confirmation, :name)
  end
end
