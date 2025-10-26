class GrowthRecordStepService < ApplicationService
  # ステップ完了
  def self.complete_step(growth_record_step, completed_at = nil)
    completed_at ||= Date.today
    guide_step = growth_record_step.guide_step
    growth_record = growth_record_step.growth_record

    # 育成中ステータスでの制限チェック
    if growth_record.status == "growing"
      # Phase 3（植え付け）が完了していて、Phase 1（種まき）が未完了の場合、
      # Phase 1とPhase 2は完了不可（植え付けから開始した場合）
      phase1_completed = growth_record.growth_record_steps.joins(:guide_step).where(
        guide_steps: { phase: 1 },
        done: true
      ).exists?

      phase3_completed = growth_record.growth_record_steps.joins(:guide_step).where(
        guide_steps: { phase: 3 },
        done: true
      ).exists?

      if phase3_completed && !phase1_completed && (guide_step.phase == 1 || guide_step.phase == 2)
        return { success: false, error: "植え付けから栽培を開始したため、種まきと育苗は記録できません" }
      end
    end

    # Phase 0以外は時系列バリデーション
    if guide_step.phase != 0 && completed_at
      # 前のフェーズの完了日を取得（スキップされたフェーズは除外）
      previous_phases = (0...guide_step.phase).to_a

      # Phase 1/2がスキップされる条件を考慮（Phase 3完了かつPhase 1未完了の場合）
      previous_phases -= [ 1, 2 ] if phase3_completed && !phase1_completed && guide_step.phase > 3

      # 前のフェーズの最新完了日を取得
      previous_completed_dates = growth_record.growth_record_steps.joins(:guide_step).where(
        guide_steps: { phase: previous_phases },
        done: true
      ).pluck(:completed_at).compact

      if previous_completed_dates.any?
        max_previous_date = previous_completed_dates.max
        if completed_at < max_previous_date
          return { success: false, error: "完了日は前のステップの完了日（#{max_previous_date}）以降の日付を指定してください" }
        end
      end

      # 後のフェーズの完了日を取得
      next_phases = ((guide_step.phase + 1)..6).to_a
      next_completed_dates = growth_record.growth_record_steps.joins(:guide_step).where(
        guide_steps: { phase: next_phases },
        done: true
      ).pluck(:completed_at).compact

      if next_completed_dates.any?
        min_next_date = next_completed_dates.min
        if completed_at > min_next_date
          return { success: false, error: "完了日は次のステップの完了日（#{min_next_date}）以前の日付を指定してください" }
        end
      end
    end

    growth_record_step.done = true
    # Phase 0（準備）は日付を記録しない
    growth_record_step.completed_at = guide_step.phase == 0 ? nil : completed_at

    if growth_record_step.save
      # チェックポイントフェーズ（Phase 1: 種まき、Phase 3: 植え付け）完了時の処理
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
