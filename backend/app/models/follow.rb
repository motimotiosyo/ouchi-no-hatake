class Follow < ApplicationRecord
  belongs_to :follower, class_name: "User"
  belongs_to :followee, class_name: "User"

  validates :follower_id, uniqueness: { scope: :followee_id, message: "既にフォロー済みです" }
  validate :cannot_follow_self

  private

  def cannot_follow_self
    if follower_id == followee_id
      errors.add(:base, "自分自身をフォローすることはできません")
    end
  end
end
