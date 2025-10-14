class GuideStep < ApplicationRecord
  belongs_to :guide

  validates :title, presence: true
  validates :position, presence: true, numericality: { only_integer: true, greater_than: 0 }
  validates :due_days, presence: true, numericality: { only_integer: true, greater_than_or_equal_to: 0 }
end
