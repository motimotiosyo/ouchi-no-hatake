class Plant < ApplicationRecord
  has_many :growth_records, dependent: :destroy

  validates :name, presence: true
end
