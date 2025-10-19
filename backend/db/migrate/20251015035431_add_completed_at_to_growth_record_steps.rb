class AddCompletedAtToGrowthRecordSteps < ActiveRecord::Migration[7.2]
  def change
    add_column :growth_record_steps, :completed_at, :date
  end
end
