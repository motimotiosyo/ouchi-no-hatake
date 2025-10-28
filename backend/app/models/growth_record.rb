class GrowthRecord < ApplicationRecord
  belongs_to :user
  belongs_to :plant, optional: true
  belongs_to :guide, optional: true
  has_many :posts, dependent: :destroy
  has_many :favorite_growth_records, dependent: :destroy
  has_many :growth_record_steps, dependent: :destroy

  # サムネイル画像添付（1枚のみ）
  has_one_attached :thumbnail

  validates :record_number, presence: true
  validates :started_on, presence: true, unless: :planning?
  validates :custom_plant_name, length: { maximum: 50 }, allow_blank: true

  # サムネイル画像のバリデーション
  validate :validate_thumbnail
  # 品種またはフリー入力のいずれか必須
  validate :either_plant_or_custom_name

  enum status: {
    planning: 0,
    growing: 1,
    completed: 2,
    failed: 3
  }

  # 表示用の品種名（品種名 or フリー入力名）
  def plant_display_name
    plant&.name || custom_plant_name
  end

  # フリー入力の品種かどうか
  def custom_plant?
    plant_id.nil? && custom_plant_name.present?
  end

  enum planting_method: {
    seed: 0,
    seedling: 1
  }

  # お気に入り数を取得
  def favorites_count
    favorite_growth_records.count
  end

  # 指定ユーザーがお気に入り済みかチェック
  def favorited_by?(user)
    return false unless user

    favorite_growth_records.exists?(user: user)
  end

  # 全成長記録の record_number を再計算
  def self.resequence_all
    User.find_each do |user|
      Plant.find_each do |plant|
        user.growth_records.where(plant: plant)
          .order(:created_at)
          .each_with_index do |record, index|
            record.update_column(:record_number, index + 1)
          end
      end
    end
  end

  private

  def validate_thumbnail
    return unless thumbnail.attached?

    # ファイルサイズ制限（10MB）
    if thumbnail.blob.byte_size > 10.megabytes
      errors.add(:thumbnail, "ファイルサイズは10MB以下にしてください")
    end

    # Content-Type検証
    unless [ "image/jpeg", "image/png" ].include?(thumbnail.blob.content_type)
      errors.add(:thumbnail, "JPEG（.jpg）またはPNG（.png）形式のみ対応しています")
    end

    # ファイル名と拡張子の検証
    filename = thumbnail.blob.filename.to_s.downcase
    content_type = thumbnail.blob.content_type

    if (filename.end_with?(".jpg", ".jpeg") && content_type != "image/jpeg") ||
       (filename.end_with?(".png") && content_type != "image/png")
      errors.add(:thumbnail, "ファイル名とファイル形式が一致しません")
    end
  end

  def either_plant_or_custom_name
    if plant_id.blank? && custom_plant_name.blank?
      errors.add(:base, "品種を選択するか、フリー入力してください")
    end
  end
end
