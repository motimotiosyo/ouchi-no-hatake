class GrowthRecordStepService < ApplicationService
  # ステップ完了
  def self.complete_step(growth_record_step, completed_at = nil)
    completed_at ||= Date.today

    growth_record_step.done = true
    growth_record_step.completed_at = completed_at

    if growth_record_step.save
      # 次のステップのscheduled_onを再計算
      recalculate_next_steps(growth_record_step.growth_record)

      { success: true, data: growth_record_step }
    else
      { success: false, error: growth_record_step.errors.full_messages.join(", ") }
    end
  end

  # ステップ未完了に戻す
  def self.uncomplete_step(growth_record_step)
    growth_record_step.done = false
    growth_record_step.completed_at = nil

    if growth_record_step.save
      recalculate_next_steps(growth_record_step.growth_record)

      { success: true, data: growth_record_step }
    else
      { success: false, error: growth_record_step.errors.full_messages.join(", ") }
    end
  end

  # 全ステップのscheduled_onを再計算
  def self.recalculate_next_steps(growth_record)
    base_date = GrowthRecordService.send(:determine_base_date, growth_record)
    base_step_due_days = GrowthRecordService.send(:determine_base_step_due_days, growth_record)

    growth_record.growth_record_steps.each do |step|
      adjusted_due_days = step.guide_step.due_days - base_step_due_days
      step.scheduled_on = base_date + adjusted_due_days.days
      step.save
    end
  end
  private_class_method :recalculate_next_steps
end
