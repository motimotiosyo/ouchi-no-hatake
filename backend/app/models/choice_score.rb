class ChoiceScore < ApplicationRecord
  belongs_to :choice
  belongs_to :plant

  validates :score, presence: true, numericality: { only_integer: true }
  validates :choice_id, presence: true
  validates :plant_id, presence: true
  validates :choice_id, uniqueness: { scope: :plant_id, message: "この選択肢と植物の組み合わせは既に存在します" }
end
