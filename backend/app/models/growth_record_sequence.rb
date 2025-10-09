class GrowthRecordSequence < ApplicationRecord
  belongs_to :user
  belongs_to :plant

  validates :last_number, presence: true, numericality: { only_integer: true, greater_than_or_equal_to: 0 }

  # 次の番号を取得してインクリメント（トランザクション内で排他ロック）
  def self.next_number(user, plant)
    sequence = find_or_create_by!(user: user, plant: plant) do |seq|
      seq.last_number = 0
    end

    # 排他ロックで取得して更新
    sequence.with_lock do
      sequence.last_number += 1
      sequence.save!
      sequence.last_number
    end
  end
end
