class GrowthRecord < ApplicationRecord
  belongs_to :user
  belongs_to :plant
  has_many :posts, dependent: :destroy

  validates :record_number, presence: true
  validates :started_on, presence: true, unless: :planning?

  enum status: {
    planning: 0,
    growing: 1,
    completed: 2,
    failed: 3
  }

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
end
