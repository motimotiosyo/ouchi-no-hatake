class User < ApplicationRecord
  has_secure_password
  has_many :posts, dependent: :destroy
  has_many :growth_records, dependent: :destroy

  validates :email, presence: true, uniqueness: true, format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :password, length: { minimum: 6 }, if: -> { new_record? || !password.nil? }
  validates :name, presence: true

  before_save :downcase_email

  # メール認証用のトークンを生成
  def generate_email_verification_token!
    self.email_verification_token = SecureRandom.urlsafe_base64(32)
    self.email_verification_sent_at = Time.current
    save!
  end

  # メール認証済みかどうかを確認
  def email_verified?
    email_verified
  end

  # メール認証を完了する
  def verify_email!
    self.email_verified = true
    self.email_verification_token = nil
    save!
  end

  # メール認証トークンが期限切れ（24時間）かどうかを確認
  def verification_expired?
    email_verification_sent_at && email_verification_sent_at < 24.hours.ago
  end

  # verification_expired?のエイリアス（issueの達成条件に合わせて）
  def verification_token_expired?
    verification_expired?
  end

  # 削除対象の未認証ユーザーを取得するスコープ（24時間経過）
  scope :unverified_expired, -> {
    where(email_verified: false)
    .where("email_verification_sent_at < ?", 24.hours.ago)
  }

  private

  def downcase_email
    self.email = email.downcase
  end
end
