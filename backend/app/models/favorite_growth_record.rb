class FavoriteGrowthRecord < ApplicationRecord
  belongs_to :user
  belongs_to :growth_record

  validates :user_id, uniqueness: { scope: :growth_record_id, message: "既にお気に入り済みです" }
end
