class ChangeStatusToIntegerInGrowthRecords < ActiveRecord::Migration[7.2]
  def change
    # 既存のstringデータを一旦変換
    execute <<-SQL
      UPDATE growth_records#{' '}
      SET status = CASE#{' '}
        WHEN status = 'planning' THEN '0'
        WHEN status = 'growing' THEN '1'
        WHEN status = 'completed' THEN '2'
        WHEN status = 'failed' THEN '3'
        ELSE '0'
      END
    SQL

    # カラムの型をintegerに変更（USINGを使用）
    change_column :growth_records, :status, :integer, default: 0, using: 'status::integer'
  end
end
