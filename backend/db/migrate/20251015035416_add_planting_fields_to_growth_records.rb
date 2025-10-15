class AddPlantingFieldsToGrowthRecords < ActiveRecord::Migration[7.2]
  def change
    add_column :growth_records, :planting_started_on, :date
    add_column :growth_records, :planting_method, :integer, default: 0
  end
end
