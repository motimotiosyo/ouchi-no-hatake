class Question < ApplicationRecord
  has_many :choices, dependent: :destroy

  validates :text, presence: true
end
