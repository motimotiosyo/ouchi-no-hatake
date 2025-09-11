class Comment < ApplicationRecord
  belongs_to :user
  belongs_to :post
  belongs_to :parent_comment, class_name: 'Comment', optional: true
  has_many :replies, class_name: 'Comment', foreign_key: 'parent_comment_id', dependent: :destroy

  validates :content, presence: true, length: { maximum: 255 }

  # トップレベルコメント（リプライではない）
  scope :top_level, -> { where(parent_comment_id: nil) }
  
  # リプライかどうか判定
  def reply?
    parent_comment_id.present?
  end

  # リプライの数を取得
  def replies_count
    replies.count
  end
end