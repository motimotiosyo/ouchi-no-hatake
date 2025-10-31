class UserProvider < ApplicationRecord
  belongs_to :user

  validates :provider, presence: true
  validates :uid, presence: true, uniqueness: { scope: :provider }
  validates :email, format: { with: URI::MailTo::EMAIL_REGEXP }, allow_blank: true
end
