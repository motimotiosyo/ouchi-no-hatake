class CreateFavoriteGrowthRecords < ActiveRecord::Migration[7.2]
  def change
    create_table :favorite_growth_records do |t|
      t.references :user, null: false, foreign_key: true
      t.references :growth_record, null: false, foreign_key: true

      t.timestamps
    end

    add_index :favorite_growth_records, [ :user_id, :growth_record_id ], unique: true, name: "index_favorite_growth_records_on_user_and_growth_record"
  end
end
