class Post < ApplicationRecord
  belongs_to :user
  belongs_to :growth_record, optional: true
  belongs_to :category, optional: true

  has_many_attached :images

  # 画像のバリデーション
  validate :validate_images

  validates :content, presence: true
  validates :post_type, presence: true

  enum post_type: {
    growth_record_post: 0,
    general_post: 1
  }

  scope :timeline, -> { includes(:user, :category, growth_record: [ :plant ]).order(created_at: :desc) }
  scope :growth_record_posts, -> { where(post_type: :growth_record_post) }
  scope :general_posts, -> { where(post_type: :general_post) }

  private

  def validate_images
    return unless images.attached?

    # 枚数制限
    if images.count > 4
      errors.add(:images, "画像は最大4枚まで添付できます")
    end

    images.each_with_index do |image, index|
      # ファイルサイズ制限（10MB）
      if image.blob.byte_size > 10.megabytes
        errors.add(:images, "画像#{index + 1}: ファイルサイズは10MB以下にしてください")
      end

      # Content-Type検証
      unless [ "image/jpeg", "image/png" ].include?(image.blob.content_type)
        errors.add(:images, "画像#{index + 1}: JPEG（.jpg）またはPNG（.png）形式のみ対応しています")
      end

      # ファイル名と拡張子の検証
      filename = image.blob.filename.to_s.downcase
      content_type = image.blob.content_type

      if (filename.end_with?(".jpg", ".jpeg") && content_type != "image/jpeg") ||
         (filename.end_with?(".png") && content_type != "image/png")
        errors.add(:images, "画像#{index + 1}: ファイル名とファイル形式が一致しません")
      end
    end
  end
end
