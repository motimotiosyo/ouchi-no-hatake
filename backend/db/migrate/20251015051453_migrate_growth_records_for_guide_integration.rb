class MigrateGrowthRecordsForGuideIntegration < ActiveRecord::Migration[7.2]
  def up
    # 1. planting_started_onのデータをstarted_onに統合
    # started_onがnilで、planting_started_onに値がある場合は移行
    execute <<-SQL
      UPDATE growth_records
      SET started_on = planting_started_on
      WHERE started_on IS NULL AND planting_started_on IS NOT NULL
    SQL

    # 2. 育成中で既存のレコードにgrowth_record_stepsを生成
    GrowthRecord.where(status: :growing).includes(:guide).find_each do |record|
      next unless record.guide
      next if record.growth_record_steps.exists?

      # 全ステップ分のgrowth_record_stepsを作成
      record.guide.guide_steps.order(:position).each do |guide_step|
        record.growth_record_steps.create!(
          guide_step: guide_step,
          done: false,
          scheduled_on: nil
        )
      end
    end

    # 3. planting_started_onカラムを削除
    remove_column :growth_records, :planting_started_on
  end

  def down
    # ロールバック時はplanting_started_onカラムを復元
    add_column :growth_records, :planting_started_on, :date
  end
end
