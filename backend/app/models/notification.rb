class Notification < ApplicationRecord
  belongs_to :user
  belongs_to :actor, class_name: "User"
  belongs_to :notifiable, polymorphic: true

  enum notification_type: {
    like: 0,
    comment: 1,
    reply: 2,
    favorite: 3
  }

  validates :notification_type, presence: true
  validates :message, presence: true
  validates :read, inclusion: { in: [ true, false ] }

  # 未読通知のスコープ
  scope :unread, -> { where(read: false) }

  # 最新順
  scope :recent, -> { order(created_at: :desc) }

  # 既読にする
  def mark_as_read!
    update!(read: true)
  end
end
