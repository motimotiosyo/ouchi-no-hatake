class AuthService < ApplicationService
  class ValidationError < StandardError
    attr_reader :details

    def initialize(message, details = nil)
      super(message)
      @details = details
    end
  end

  class AuthenticationError < StandardError; end
  class EmailNotVerifiedError < StandardError; end
  class TokenExpiredError < StandardError; end

  # ユーザー登録処理
  def self.register_user(params)
    user = User.new(params)

    if user.save
      # メール認証トークン生成
      user.generate_email_verification_token!

      # 認証メール送信
      send_verification_email(user)

      ApplicationSerializer.success(
        data: build_registration_response(user)
      )
    else
      raise ValidationError.new(
        "登録できませんでした。入力内容をご確認ください",
        user.errors.full_messages
      )
    end
  end

  # ログイン処理
  def self.login_user(email, password)
    user = User.find_by(email: email&.downcase)

    unless user&.authenticate(password)
      raise AuthenticationError.new("メールアドレスまたはパスワードが正しくありません")
    end

    unless user.email_verified?
      raise EmailNotVerifiedError.new("メールアドレスの認証が完了していません。認証メールをご確認ください")
    end

    # JWT発行
    token = JsonWebToken.encode(user_id: user.id)

    ApplicationSerializer.success(
      data: build_login_response(user, token)
    )
  end

  # ログアウト処理
  def self.logout_user(token)
    return ApplicationSerializer.error(message: "トークンが提供されていません", code: "MISSING_TOKEN") if token.blank?

    blacklist_result = JsonWebToken.blacklist_token(token)

    ApplicationSerializer.success(
      data: { message: "ログアウトに成功しました" }
    )
  rescue StandardError => e
    Rails.logger.error "Logout error: #{e.message}"
    ApplicationSerializer.error(
      message: "ログアウトに失敗しました",
      code: "LOGOUT_FAILED"
    )
  end

  # トークン検証
  def self.verify_token(token)
    return ApplicationSerializer.success(data: { valid: false }) if token.blank?

    ApplicationSerializer.success(data: { valid: JsonWebToken.valid_token?(token) })
  end

  # メール認証処理
  def self.verify_email(token)
    return ApplicationSerializer.error(message: "認証トークンが提供されていません", code: "MISSING_TOKEN") if token.blank?

    user = User.find_by(email_verification_token: token)
    return ApplicationSerializer.error(message: "無効な認証トークンです", code: "INVALID_TOKEN") if user.nil?

    if user.verification_token_expired?
      raise TokenExpiredError.new("認証トークンの有効期限が切れています。再度登録をお試しください")
    end

    # メール認証完了
    user.verify_email!

    # JWT発行
    jwt_token = JsonWebToken.encode(user_id: user.id)

    ApplicationSerializer.success(
      data: build_email_verification_response(user, jwt_token)
    )
  end

  # 認証メール再送
  def self.resend_verification(email)
    user = User.find_by(email: email&.downcase)
    return ApplicationSerializer.error(message: "ユーザーが見つかりません", code: "USER_NOT_FOUND") unless user

    if user.email_verified?
      return ApplicationSerializer.error(message: "このメールアドレスは既に認証済みです", code: "ALREADY_VERIFIED")
    end

    # 新しいトークン生成
    user.generate_email_verification_token!

    # メール送信
    send_verification_email(user)

    ApplicationSerializer.success(
      data: { message: "認証メールを再送しました" }
    )
  end

  # パスワードリセット要求
  def self.forgot_password(email)
    return ApplicationSerializer.error(message: "メールアドレスが提供されていません", code: "MISSING_EMAIL") if email.blank?

    user = User.find_by(email: email&.downcase)

    if user.nil?
      # セキュリティのため、ユーザーが存在しない場合も成功レスポンスを返す
      return ApplicationSerializer.success(
        data: { message: "パスワードリセットメールを送信しました。メールをご確認ください" }
      )
    end

    # メール未認証ユーザーの場合
    unless user.email_verified?
      return ApplicationSerializer.error(message: "メールアドレスの認証が完了していません", code: "EMAIL_NOT_VERIFIED")
    end

    # パスワードリセットトークンを生成（PasswordResetTokenモデル使用）
    reset_token = PasswordResetToken.generate_for_email(user.email)

    # リセットメール送信
    send_password_reset_email_with_token(user, reset_token.token)

    ApplicationSerializer.success(
      data: { message: "パスワードリセットメールを送信しました。メールをご確認ください" }
    )
  end

  # パスワードリセット実行
  def self.reset_password(token, new_password, password_confirmation)
    return ApplicationSerializer.error(message: "リセットトークンが提供されていません", code: "MISSING_TOKEN") if token.blank?
    return ApplicationSerializer.error(message: "パスワードが提供されていません", code: "MISSING_PASSWORD") if new_password.blank? || password_confirmation.blank?

    if new_password != password_confirmation
      return ApplicationSerializer.error(message: "パスワードが一致しません", code: "PASSWORD_MISMATCH")
    end

    # トークンの有効性チェック
    reset_token = PasswordResetToken.find_valid_token(token)
    return ApplicationSerializer.error(message: "無効または期限切れのリセットトークンです", code: "INVALID_TOKEN") if reset_token.nil?

    # ユーザーを検索
    user = User.find_by(email: reset_token.email)
    return ApplicationSerializer.error(message: "ユーザーが見つかりません", code: "USER_NOT_FOUND") if user.nil?

    # パスワードを更新
    if user.update(password: new_password, password_confirmation: password_confirmation)
      # リセットトークンを削除
      reset_token.destroy

      ApplicationSerializer.success(
        data: { message: "パスワードが正常に更新されました" }
      )
    else
      raise ValidationError.new(
        "パスワードの更新に失敗しました。パスワードは6文字以上で設定してください",
        user.errors.full_messages
      )
    end
  end

  # 現在のユーザー情報取得
  def self.get_current_user_data(user)
    user_data = build_user_response(user).merge(email_verified: user.email_verified?)
    ApplicationSerializer.success(data: { user: user_data })
  end

  private

  # 認証メール送信
  def self.send_verification_email(user)
    frontend_url = ENV.fetch("FRONTEND_URL", "http://localhost:3001")
    verification_url = "#{frontend_url}/verify-email?token=#{user.email_verification_token}"
    UserMailer.email_verification(user, verification_url).deliver_now
  end

  # パスワードリセットメール送信
  def self.send_password_reset_email_with_token(user, token)
    frontend_url = ENV.fetch("FRONTEND_URL", "http://localhost:3001")
    reset_url = "#{frontend_url}/reset-password?token=#{token}"
    UserMailer.password_reset(user, reset_url).deliver_now
  end

  # レスポンス構築メソッド群
  def self.build_registration_response(user)
    {
      message: "ユーザー登録が完了しました。認証メールをご確認ください",
      requires_verification: true,
      user: build_user_response(user)
    }
  end

  def self.build_login_response(user, token)
    {
      message: "ログインに成功しました",
      token: token,
      user: build_user_response(user)
    }
  end

  def self.build_email_verification_response(user, token)
    {
      message: "メールアドレスの認証が完了しました",
      token: token,
      user: build_user_response(user)
    }
  end

  def self.build_user_response(user)
    avatar_url = if user.avatar.attached?
      if Rails.env.development?
        Rails.application.routes.url_helpers.rails_blob_url(user.avatar, host: "http://localhost:3001")
      else
        Rails.application.routes.url_helpers.rails_blob_path(user.avatar, only_path: true)
      end
    else
      nil
    end

    {
      id: user.id,
      email: user.email,
      name: user.name,
      bio: user.bio,
      avatar_url: avatar_url,
      created_at: user.created_at.iso8601
    }
  end

  def self.build_email_not_verified_response(email)
    {
      error: "メールアドレスの認証が完了していません。認証メールをご確認ください",
      requires_verification: true,
      email: email
    }
  end
end
