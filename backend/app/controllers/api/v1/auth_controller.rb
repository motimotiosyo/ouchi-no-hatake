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
    begin
      result = AuthService.forgot_password(params[:email])
      
      if result.success
        render json: result.data, status: :ok
      else
        render json: { error: result.error }, status: :bad_request
      end
    rescue => e
      Rails.logger.error "Error in AuthController#forgot_password: #{e.message}"
      Rails.logger.error e.backtrace.join("\n")
      render json: { error: "パスワードリセットの申請に失敗しました" }, status: :internal_server_error
    end
  end

  # PUT /api/v1/auth/reset_password
  def reset_password
    begin
      result = AuthService.reset_password(
        params[:token],
        params[:password], 
        params[:password_confirmation]
      )
      
      if result.success
        render json: result.data, status: :ok
      else
        render json: { error: result.error }, status: :bad_request
      end
    rescue AuthService::TokenExpiredError => e
      render json: { error: e.message }, status: :unprocessable_entity
    rescue AuthService::ValidationError => e
      render json: {
        error: e.message,
        details: e.details
      }, status: :unprocessable_entity
    rescue => e
      Rails.logger.error "Error in AuthController#reset_password: #{e.message}"
      Rails.logger.error e.backtrace.join("\n")
      render json: { error: "パスワードのリセットに失敗しました" }, status: :internal_server_error
    end
  end

  # GET /api/v1/auth/me
  def me
    user_data = AuthService.get_current_user_data(current_user)
    render json: { user: user_data.merge(email_verified: current_user.email_verified?) }, status: :ok
  end

  private

  def user_params
    params.require(:user).permit(:email, :password, :password_confirmation, :name)
  end
end
