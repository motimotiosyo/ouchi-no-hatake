class JwtBlacklist < ApplicationRecord
  validates :jti, presence: true, uniqueness: true
  validates :expires_at, presence: true

  # 期限切れのトークンを削除するクラスメソッド
  def self.cleanup_expired
    where("expires_at < ?", Time.current).delete_all
  end

  # トークンがブラックリストに登録されているかチェック
  def self.blacklisted?(jti)
    exists?(jti: jti)
  end

  # トークンをブラックリストに追加
  def self.add_to_blacklist(jti, expires_at)
    create!(jti: jti, expires_at: expires_at)
  rescue ActiveRecord::RecordNotUnique
    # 既に登録済みの場合は無視
    true
  end
end
