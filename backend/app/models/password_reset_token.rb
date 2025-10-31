class PasswordResetToken < ApplicationRecord
  validates :email, presence: true, format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :token, presence: true, uniqueness: true
  validates :expires_at, presence: true

  # トークンの有効期限（1時間）
  TOKEN_EXPIRY_HOURS = 1

  # 新しいパスワードリセットトークンを生成
  def self.generate_for_email(email)
    # 既存の同一メールアドレスのトークンを削除
    where(email: email.downcase).destroy_all

    # 新しいトークンを生成
    token = SecureRandom.urlsafe_base64(32)
    expires_at = TOKEN_EXPIRY_HOURS.hours.from_now

    create!(
      email: email.downcase,
      token: token,
      expires_at: expires_at
    )
  end

  # トークンで検索し、有効性をチェック
  def self.find_valid_token(token)
    find_by(token: token)&.tap do |reset_token|
      return nil if reset_token.expired?
    end
  end

  # トークンが期限切れかどうかを確認
  def expired?
    expires_at < Time.current
  end

  # トークンが有効かどうかを確認
  def valid_token?
    !expired?
  end

  # 期限切れトークンを削除するスコープ
  scope :expired, -> { where("expires_at < ?", Time.current) }

  # 期限切れトークンをクリーンアップ
  def self.cleanup_expired
    expired.destroy_all
  end
end
