class CreateGrowthRecordSteps < ActiveRecord::Migration[7.2]
  def change
    create_table :growth_record_steps do |t|
      t.references :growth_record, null: false, foreign_key: true
      t.references :guide_step, null: false, foreign_key: true
      t.date :scheduled_on
      t.boolean :done

      t.timestamps
    end
  end
end
