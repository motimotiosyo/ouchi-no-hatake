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

      OpenStruct.new(
        success: true,
        user: user,
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

    OpenStruct.new(
      success: true,
      user: user,
      token: token,
      data: build_login_response(user, token),
      email_not_verified_data: build_email_not_verified_response(user.email)
    )
  end

  # ログアウト処理
  def self.logout_user(token)
    return OpenStruct.new(success: false, error: "トークンが提供されていません") if token.blank?

    blacklist_result = JsonWebToken.blacklist_token(token)

    OpenStruct.new(
      success: true,
      data: { message: "ログアウトに成功しました" }
    )
  rescue StandardError => e
    Rails.logger.error "Logout error: #{e.message}"
    OpenStruct.new(
      success: false,
      error: "ログアウトに失敗しました"
    )
  end

  # トークン検証
  def self.verify_token(token)
    return { valid: false } if token.blank?

    { valid: JsonWebToken.valid_token?(token) }
  end

  # メール認証処理
  def self.verify_email(token)
    return OpenStruct.new(success: false, error: "認証トークンが提供されていません") if token.blank?

    user = User.find_by(email_verification_token: token)
    return OpenStruct.new(success: false, error: "無効な認証トークンです") if user.nil?

    if user.verification_token_expired?
      raise TokenExpiredError.new("認証トークンの有効期限が切れています。再度登録をお試しください")
    end

    # メール認証完了
    user.verify_email!

    # JWT発行
    jwt_token = JsonWebToken.encode(user_id: user.id)

    OpenStruct.new(
      success: true,
      user: user,
      token: jwt_token,
      data: build_email_verification_response(user, jwt_token)
    )
  end

  # 認証メール再送
  def self.resend_verification(email)
    user = User.find_by(email: email&.downcase)
    return OpenStruct.new(success: false, error: "ユーザーが見つかりません") unless user

    if user.email_verified?
      return OpenStruct.new(success: false, error: "このメールアドレスは既に認証済みです")
    end

    # 新しいトークン生成
    user.generate_email_verification_token!

    # メール送信
    send_verification_email(user)

    OpenStruct.new(
      success: true,
      data: { message: "認証メールを再送しました" }
    )
  end

  # パスワードリセット要求
  def self.forgot_password(email)
    return OpenStruct.new(success: false, error: "メールアドレスが提供されていません") if email.blank?

    user = User.find_by(email: email&.downcase)

    if user.nil?
      # セキュリティのため、ユーザーが存在しない場合も成功レスポンスを返す
      return OpenStruct.new(
        success: true,
        data: { message: "パスワードリセットメールを送信しました。メールをご確認ください" }
      )
    end

    # メール未認証ユーザーの場合
    unless user.email_verified?
      return OpenStruct.new(success: false, error: "メールアドレスの認証が完了していません")
    end

    # パスワードリセットトークンを生成（PasswordResetTokenモデル使用）
    reset_token = PasswordResetToken.generate_for_email(user.email)

    # リセットメール送信
    send_password_reset_email_with_token(user, reset_token.token)

    OpenStruct.new(
      success: true,
      data: { message: "パスワードリセットメールを送信しました。メールをご確認ください" }
    )
  end

  # パスワードリセット実行
  def self.reset_password(token, new_password, password_confirmation)
    return OpenStruct.new(success: false, error: "リセットトークンが提供されていません") if token.blank?
    return OpenStruct.new(success: false, error: "パスワードが提供されていません") if new_password.blank? || password_confirmation.blank?

    if new_password != password_confirmation
      return OpenStruct.new(success: false, error: "パスワードが一致しません")
    end

    # トークンの有効性チェック
    reset_token = PasswordResetToken.find_valid_token(token)
    return OpenStruct.new(success: false, error: "無効または期限切れのリセットトークンです") if reset_token.nil?

    # ユーザーを検索
    user = User.find_by(email: reset_token.email)
    return OpenStruct.new(success: false, error: "ユーザーが見つかりません") if user.nil?

    # パスワードを更新
    if user.update(password: new_password, password_confirmation: password_confirmation)
      # リセットトークンを削除
      reset_token.destroy

      OpenStruct.new(
        success: true,
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
    build_user_response(user)
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
    {
      id: user.id,
      email: user.email,
      name: user.name
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
