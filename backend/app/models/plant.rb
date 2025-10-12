class Plant < ApplicationRecord
  has_many :growth_records, dependent: :destroy
  has_many :choice_scores, dependent: :destroy
  has_many :choices, through: :choice_scores

  validates :name, presence: true
end
