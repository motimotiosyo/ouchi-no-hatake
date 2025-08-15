class Post < ApplicationRecord
  belongs_to :user
  belongs_to :growth_record, optional: true
  belongs_to :category, optional: true

  has_many_attached :images

  validates :content, presence: true
  validates :post_type, presence: true

  enum post_type: {
    growth_record_post: 0,
    general_post: 1
  }

  scope :timeline, -> { includes(:user, :category, growth_record: [ :plant ]).order(created_at: :desc) }
  scope :growth_record_posts, -> { where(post_type: :growth_record_post) }
  scope :general_posts, -> { where(post_type: :general_post) }
end
