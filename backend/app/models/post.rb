class Post < ApplicationRecord
  belongs_to :user
  belongs_to :growth_record
  belongs_to :category

  validates :title, presence: true
  validates :content, presence: true
  validates :destination_type, presence: true

  enum destination_type: {
    public_post: 0,
    friends_only: 1,
    private_post: 2
  }

  scope :timeline, -> { where(destination_type: :public_post).includes(:user, :category, growth_record: :plant).order(created_at: :desc) }
end