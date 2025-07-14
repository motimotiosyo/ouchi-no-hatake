class Plant < ApplicationRecord
  has_many :growth_records, dependent: :destroy
  has_many :guides, dependent: :destroy

  validates :name, presence: true
end
