class Choice < ApplicationRecord
  belongs_to :question
  has_many :choice_scores, dependent: :destroy
  has_many :plants, through: :choice_scores

  validates :text, presence: true
  validates :question_id, presence: true
end
