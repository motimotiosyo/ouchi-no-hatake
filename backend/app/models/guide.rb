class Guide < ApplicationRecord
  belongs_to :plant
  has_many :guide_steps, -> { order(:position) }, dependent: :destroy
  has_many :growth_records, dependent: :nullify

  validates :plant_id, presence: true
end
