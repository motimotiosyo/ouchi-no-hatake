class CreateGrowthRecords < ActiveRecord::Migration[7.2]
  def change
    create_table :growth_records do |t|
      t.references :user, null: false, foreign_key: true
      t.references :plant, null: false, foreign_key: true
      t.integer :record_number
      t.string :record_name
      t.string :location
      t.date :started_on
      t.date :ended_on
      t.string :status

      t.timestamps
    end
  end
end
