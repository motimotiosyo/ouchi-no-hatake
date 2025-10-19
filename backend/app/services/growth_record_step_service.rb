class GrowthRecordStepService < ApplicationService
  # ステップ完了
  def self.complete_step(growth_record_step, completed_at = nil)
    completed_at ||= Date.today

    growth_record_step.done = true
    growth_record_step.completed_at = completed_at

    if growth_record_step.save
      # チェックポイントフェーズ（Phase 1: 種まき、Phase 3: 植え付け）完了時の処理
      growth_record = growth_record_step.growth_record
      guide_step = growth_record_step.guide_step

      # 計画中かつチェックポイントフェーズの完了の場合、育成中に移行
      if growth_record.status == "planning" && (guide_step.phase == 1 || guide_step.phase == 3)
        growth_record.started_on = completed_at
        growth_record.status = "growing"
        growth_record.save
      end

      # 育成中かつチェックポイントフェーズの日付更新の場合、started_onも更新
      if growth_record.status == "growing" && (guide_step.phase == 1 || guide_step.phase == 3)
        # このステップがstarted_onの基準になっている場合のみ更新
        # （他のチェックポイントの方が古い日付の場合は更新しない）
        other_checkpoint_dates = growth_record.growth_record_steps.joins(:guide_step).where(
          guide_steps: { phase: [ 1, 3 ] },
          done: true
        ).where.not(id: growth_record_step.id).pluck(:completed_at).compact

        # 他のチェックポイントがない、または今回の日付が最も古い場合
        if other_checkpoint_dates.empty? || completed_at <= other_checkpoint_dates.min
          growth_record.started_on = completed_at
          growth_record.save
        end
      end

      # 次のステップのscheduled_onを再計算
      recalculate_next_steps(growth_record)

      { success: true, data: growth_record_step }
    else
      { success: false, error: growth_record_step.errors.full_messages.join(", ") }
    end
  end

  # ステップ未完了に戻す
  def self.uncomplete_step(growth_record_step)
    growth_record = growth_record_step.growth_record
    guide_step = growth_record_step.guide_step

    # 育成中ステータスでは重要フェーズ（Phase 0, 1, 3）の完了取消を制限
    if growth_record.status == "growing"
      # Phase 0（栽培準備）の完了取消を禁止
      if guide_step.phase == 0
        return { success: false, error: "育成中は栽培準備の完了を取り消すことはできません" }
      end

      # Phase 1（種まき）またはPhase 3（植え付け）の完了取消を制限
      if guide_step.phase == 1 || guide_step.phase == 3
        # 他のチェックポイントフェーズが完了しているか確認
        other_checkpoint_completed = growth_record.growth_record_steps.joins(:guide_step).where(
          guide_steps: { phase: [ 1, 3 ] },
          done: true
        ).where.not(id: growth_record_step.id).exists?

        # 他のチェックポイントも完了していない場合は取消を拒否
        unless other_checkpoint_completed
          return { success: false, error: "育成中は種まきまたは植え付けのいずれかが完了している必要があります" }
        end
      end
    end

    growth_record_step.done = false
    growth_record_step.completed_at = nil

    if growth_record_step.save
      # 次のステップのscheduled_onを再計算
      recalculate_next_steps(growth_record)

      { success: true, data: growth_record_step }
    else
      { success: false, error: growth_record_step.errors.full_messages.join(", ") }
    end
  end

  # 全ステップのscheduled_onを再計算
  def self.recalculate_next_steps(growth_record)
    # 計画中（started_onがnil）の場合はスキップ
    return if growth_record.started_on.nil?

    base_date = GrowthRecordService.send(:determine_base_date, growth_record)
    base_step_due_days = GrowthRecordService.send(:determine_base_step_due_days, growth_record)

    # base_dateがnilの場合もスキップ（完了ステップがなく、started_onもない状態）
    return if base_date.nil?

    growth_record.growth_record_steps.each do |step|
      adjusted_due_days = step.guide_step.due_days - base_step_due_days
      step.scheduled_on = base_date + adjusted_due_days.days
      step.save
    end
  end
  private_class_method :recalculate_next_steps
end
