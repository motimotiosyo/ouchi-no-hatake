class User < ApplicationRecord
  has_secure_password
  has_many :posts, dependent: :destroy
  has_many :growth_records, dependent: :destroy

  validates :email, presence: true, uniqueness: true, format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :password, length: { minimum: 6 }, if: -> { new_record? || !password.nil? }
  validates :name, presence: true

  before_save :downcase_email

  private

  def downcase_email
    self.email = email.downcase
  end
end
