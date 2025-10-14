class Plant < ApplicationRecord
  has_many :growth_records, dependent: :destroy
  has_many :choice_scores, dependent: :destroy
  has_many :choices, through: :choice_scores
  has_one :guide, dependent: :destroy

  validates :name, presence: true
end
