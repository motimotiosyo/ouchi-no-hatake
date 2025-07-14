class GrowthRecord < ApplicationRecord
  belongs_to :user
  belongs_to :plant
  has_many :posts, dependent: :destroy
  has_many :growth_record_steps, dependent: :destroy

  validates :record_name, presence: true
  validates :record_number, presence: true
  validates :started_on, presence: true

  enum status: {
    planning: 0,
    growing: 1,
    completed: 2,
    failed: 3
  }
end
