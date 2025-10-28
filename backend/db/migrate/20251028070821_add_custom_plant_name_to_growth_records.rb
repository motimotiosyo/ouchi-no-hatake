class AddCustomPlantNameToGrowthRecords < ActiveRecord::Migration[7.2]
  def change
    add_column :growth_records, :custom_plant_name, :string, limit: 50
    change_column_null :growth_records, :plant_id, true
  end
end
