class AddRecordNumberSequenceToGrowthRecords < ActiveRecord::Migration[7.2]
  def change
    # ユーザー×植物ごとのrecord_number最大値を記録するテーブル
    create_table :growth_record_sequences do |t|
      t.references :user, null: false, foreign_key: true
      t.references :plant, null: false, foreign_key: true
      t.integer :last_number, null: false, default: 0

      t.timestamps
    end

    # ユーザー×植物の組み合わせは一意
    add_index :growth_record_sequences, [ :user_id, :plant_id ], unique: true

    # 既存データの最大値で初期化
    reversible do |dir|
      dir.up do
        execute <<-SQL
          INSERT INTO growth_record_sequences (user_id, plant_id, last_number, created_at, updated_at)
          SELECT
            user_id,
            plant_id,
            COALESCE(MAX(record_number), 0) as last_number,
            NOW(),
            NOW()
          FROM growth_records
          GROUP BY user_id, plant_id
        SQL
      end
    end
  end
end
