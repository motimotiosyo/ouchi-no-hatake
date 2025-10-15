class AddGuideIdToGrowthRecords < ActiveRecord::Migration[7.2]
  def change
    add_reference :growth_records, :guide, null: true, foreign_key: true
  end
end
