class GrowthRecordStep < ApplicationRecord
  belongs_to :growth_record
  belongs_to :guide_step

  validates :growth_record_id, presence: true
  validates :guide_step_id, presence: true

  scope :completed, -> { where(done: true) }
  scope :incomplete, -> { where(done: false) }
end
