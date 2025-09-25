class Api::V1::AuthController < ApplicationController
  include ActionController::Cookies
  skip_before_action :authenticate_request, only: [ :register, :login, :verify, :logout, :verify_email, :resend_verification, :forgot_password, :reset_password ]
  skip_before_action :check_email_verification, only: [ :register, :login, :verify, :logout, :verify_email, :resend_verification, :forgot_password, :reset_password ]

  # POST /api/v1/auth/register
  def register
    begin
      result = AuthService.register_user(user_params)
      render json: result.data, status: :created
    rescue AuthService::ValidationError => e
      render json: {
        error: e.message,
        details: e.details
      }, status: :unprocessable_entity
    rescue => e
      Rails.logger.error "Error in AuthController#register: #{e.message}"
      Rails.logger.error e.backtrace.join("\n")
      render json: {
        error: "登録できませんでした。入力内容をご確認ください"
      }, status: :internal_server_error
    end
  end

  # POST /api/v1/auth/login
  def login
    begin
      result = AuthService.login_user(params[:email], params[:password])
      
      # サーバーサイドでCookieをセット
      cookies[:auth_token] = {
        value: result.token,
        expires: 6.months.from_now,
        path: "/",
        same_site: :none,
        secure: true,
        httponly: false
      }
      
      render json: result.data, status: :ok
    rescue AuthService::EmailNotVerifiedError => e
      render json: AuthService.build_email_not_verified_response(params[:email]), status: :forbidden
    rescue AuthService::AuthenticationError => e
      raise ExceptionHandler::AuthenticationError, e.message
    rescue => e
      Rails.logger.error "Error in AuthController#login: #{e.message}"
      Rails.logger.error e.backtrace.join("\n")
      raise ExceptionHandler::AuthenticationError, "メールアドレスまたはパスワードが正しくありません"
    end
  end

  # DELETE /api/v1/auth/logout
  def logout
    begin
      token = current_token
      result = AuthService.logout_user(token)
      
      if result.success
        # サーバーサイドでCookie削除（複数パターンで確実に削除）
        cookies.delete(:auth_token, {
          path: "/",
          same_site: :none,
          secure: true
        })
        cookies.delete(:auth_token, { path: "/" })
        cookies.delete(:auth_token)
        
        render json: result.data, status: :ok
      else
        render json: { error: result.error }, status: :bad_request
      end
    rescue => e
      Rails.logger.error "Error in AuthController#logout: #{e.message}"
      Rails.logger.error e.backtrace.join("\n")
      render json: { error: "ログアウトに失敗しました" }, status: :internal_server_error
    end
  end

  def verify
    token = cookies[:auth_token] || request.headers["Authorization"]&.split(" ")&.last
    result = AuthService.verify_token(token)
    
    if result[:valid]
      render json: { valid: true }
    else
      render json: { valid: false }, status: :unauthorized
    end
  end

  # POST /api/v1/auth/verify-email
  def verify_email
    begin
      result = AuthService.verify_email(params[:token])
      
      if result.success
        render json: result.data, status: :ok
      else
        render json: { error: result.error }, status: :bad_request
      end
    rescue AuthService::TokenExpiredError => e
      render json: {
        error: e.message,
        expired: true
      }, status: :unprocessable_entity
    rescue => e
      Rails.logger.error "Error in AuthController#verify_email: #{e.message}"
      Rails.logger.error e.backtrace.join("\n")
      render json: { error: "メール認証に失敗しました" }, status: :internal_server_error
    end
  end

  # POST /api/v1/auth/resend-verification
  def resend_verification
    begin
      result = AuthService.resend_verification(params[:email])
      
      if result.success
        render json: result.data, status: :ok
      else
        render json: { error: result.error }, status: :bad_request
      end
    rescue => e
      Rails.logger.error "Error in AuthController#resend_verification: #{e.message}"
      Rails.logger.error e.backtrace.join("\n")
      render json: { error: "認証メール再送に失敗しました" }, status: :internal_server_error
    end
  end

  # POST /api/v1/auth/forgot_password
  def forgot_password
    email = params[:email]

    if email.blank?
      render json: { error: "メールアドレスが提供されていません" }, status: :bad_request
      return
    end

    # メールアドレスでユーザーを検索
    user = User.find_by(email: email.downcase)

    if user.nil?
      # セキュリティのため、ユーザーが存在しない場合も成功レスポンスを返す
      render json: {
        message: "パスワードリセットメールを送信しました。メールをご確認ください"
      }, status: :ok
      return
    end

    # メール未認証ユーザーの場合
    unless user.email_verified?
      render json: { error: "メールアドレスの認証が完了していません" }, status: :unprocessable_entity
      return
    end

    # パスワードリセットトークンを生成
    reset_token = PasswordResetToken.generate_for_email(user.email)

    # パスワードリセットメール送信
    reset_url = "#{ENV.fetch('FRONTEND_URL', 'http://localhost:3001')}/reset-password?token=#{reset_token.token}"
    UserMailer.password_reset(user, reset_url).deliver_now

    render json: {
      message: "パスワードリセットメールを送信しました。メールをご確認ください"
    }, status: :ok
  rescue StandardError => e
    Rails.logger.error "Password reset request error: #{e.message}"
    render json: { error: "パスワードリセットの申請に失敗しました" }, status: :internal_server_error
  end

  # PUT /api/v1/auth/reset_password
  def reset_password
    token = params[:token]
    password = params[:password]
    password_confirmation = params[:password_confirmation]

    if token.blank?
      render json: { error: "リセットトークンが提供されていません" }, status: :bad_request
      return
    end

    if password.blank? || password_confirmation.blank?
      render json: { error: "パスワードが提供されていません" }, status: :bad_request
      return
    end

    if password != password_confirmation
      render json: { error: "パスワードが一致しません" }, status: :unprocessable_entity
      return
    end

    # トークンの有効性チェック
    reset_token = PasswordResetToken.find_valid_token(token)

    if reset_token.nil?
      render json: { error: "無効または期限切れのリセットトークンです" }, status: :unprocessable_entity
      return
    end

    # ユーザーを検索
    user = User.find_by(email: reset_token.email)

    if user.nil?
      render json: { error: "ユーザーが見つかりません" }, status: :not_found
      return
    end

    # パスワードを更新
    if user.update(password: password, password_confirmation: password_confirmation)
      # リセットトークンを削除
      reset_token.destroy

      render json: {
        message: "パスワードが正常に更新されました"
      }, status: :ok
    else
      render json: {
        error: "パスワードの更新に失敗しました。パスワードは6文字以上で設定してください"
      }, status: :unprocessable_entity
    end
  rescue StandardError => e
    Rails.logger.error "Password reset error: #{e.message}"
    render json: { error: "パスワードのリセットに失敗しました" }, status: :internal_server_error
  end

  # GET /api/v1/auth/me
  def me
    render json: {
      user: {
        id: current_user.id,
        email: current_user.email,
        name: current_user.name,
        email_verified: current_user.email_verified?
      }
    }, status: :ok
  end

  private

  def user_params
    params.require(:user).permit(:email, :password, :password_confirmation, :name)
  end
end
