class Guide < ApplicationRecord
  belongs_to :plant
  has_many :guide_steps, -> { order(:position) }, dependent: :destroy

  validates :plant_id, presence: true
end
