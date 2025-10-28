class ChangeGrowthRecordSequencePlantIdToNullable < ActiveRecord::Migration[7.2]
  def change
    change_column_null :growth_record_sequences, :plant_id, true
  end
end
