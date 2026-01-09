class GrowthRecordService < ApplicationService
  class ValidationError < StandardError
    attr_reader :details

    def initialize(message, details = nil)
      super(message)
      @details = details
    end
  end

  class AuthorizationError < StandardError; end

  # 成長記録一覧のレスポンス構築
  def self.build_growth_records_list(growth_records, pagination_info, current_user = nil)
    growth_records_data = growth_records.map { |record| build_growth_record_response(record, current_user) }

    {
      growth_records: growth_records_data,
      pagination: pagination_info
    }
  end

  # 単一成長記録のレスポンス構築
  def self.build_growth_record_response(record, current_user = nil)
    response = {
      id: record.id,
      record_number: record.record_number,
      record_name: record.record_name,
      location: record.location,
      planting_method: record.planting_method,
      started_on: record.started_on,
      ended_on: record.ended_on,
      status: record.status,
      created_at: record.created_at,
      updated_at: record.updated_at,
      plant: record.plant ? {
        id: record.plant.id,
        name: record.plant.name,
        description: record.plant.description
      } : nil,
      custom_plant_name: record.custom_plant_name,
      thumbnail_url: build_thumbnail_url(record),
      favorites_count: record.favorites_count,
      favorited_by_current_user: current_user ? record.favorited_by?(current_user) : false,
      user: {
        id: record.user.id,
        name: record.user.name
      }
    }

    # ガイド情報を追加（紐づいている場合のみ）
    if record.guide
      response[:guide] = {
        id: record.guide.id,
        plant: {
          id: record.guide.plant.id,
          name: record.guide.plant.name
        },
        guide_step_info: calculate_current_step_info(record)
      }
    else
      response[:guide] = nil
    end

    response
  end

  # 成長記録詳細レスポンス構築（投稿データ付き）
  def self.build_growth_record_detail(record, posts, current_user = nil)
    posts_data = posts.map do |post|
      post_data = {
        id: post.id,
        title: post.title,
        content: post.content,
        created_at: post.created_at
      }

      # カテゴリがある場合のみ追加
      if post.category
        post_data[:category] = {
          id: post.category.id,
          name: post.category.name
        }
      end

      post_data
    end

        {
      growth_record: build_growth_record_response(record, current_user).merge(
        user: {
          id: record.user.id,
          name: record.user.name
        }
      ),
      posts: posts_data
    }
  end

  # 成長記録作成
  def self.create_growth_record(user, params)
    # plant_id がある場合のみ Plant を取得
    plant = params[:plant_id].present? ? Plant.find(params[:plant_id]) : nil

    # シーケンステーブルから次の番号を取得（単調増加、再利用しない）
    # フリー入力の場合は plant が nil
    next_record_number = GrowthRecordSequence.next_number(user, plant)

    # ガイドを自動紐付け（plant_idから取得）
    guide = Guide.find_by(plant: plant)

    growth_record = user.growth_records.build(params)
    growth_record.record_number = next_record_number
    growth_record.guide = guide if guide

    # record_name が空の場合、自動生成
    if params[:record_name].blank?
      growth_record.record_name = "成長記録#{next_record_number}"
    end

    if growth_record.save
      # ガイドが紐づいている場合、全ステップ分のgrowth_record_stepsを自動生成
      if guide
        guide_steps = guide.guide_steps.order(:position)

        # 栽培方法に応じたチェックポイントフェーズを特定
        checkpoint_phase = case growth_record.planting_method
        when "seed"
                            1  # Phase 1: 種まき
        when "seedling"
                            3  # Phase 3: 植え付け
        else
                            nil
        end

        guide_steps.each do |guide_step|
          # 育成中でチェックポイントフェーズ以下の場合は自動完了
          should_complete = growth_record.status == "growing" &&
                           checkpoint_phase &&
                           guide_step.phase.present? &&
                           guide_step.phase <= checkpoint_phase

          growth_record.growth_record_steps.create!(
            guide_step: guide_step,
            done: should_complete,
            completed_at: should_complete ? growth_record.started_on : nil,
            scheduled_on: nil
          )
        end
      end

      ApplicationSerializer.success(
        data: build_growth_record_response(growth_record)
      )
    else
      raise ValidationError.new(
        "成長記録の作成に失敗しました",
        growth_record.errors.full_messages
      )
    end
  rescue ActiveRecord::RecordNotFound
    raise ValidationError.new("指定された植物が見つかりません")
  end

  # 成長記録更新
  def self.update_growth_record(record, params)
    params = handle_thumbnail_removal(record, params)
    params = handle_record_name_auto_generation(record, params)

    plant_id_changed = params.key?(:plant_id) && params[:plant_id] != record.plant_id
    planting_method_changed = params.key?(:planting_method) && params[:planting_method] != record.planting_method
    started_on_changed = params.key?(:started_on) && params[:started_on] != record.started_on

    # 育成中以降は品種変更を禁止
    if plant_id_changed && record.status.in?(%w[growing completed failed])
      raise ValidationError.new(
        "育成中以降は品種を変更できません",
        []
      )
    end

    # 育成中以降は栽培方法変更を禁止
    if planting_method_changed && record.status.in?(%w[growing completed failed])
      raise ValidationError.new(
        "育成中以降は栽培方法を変更できません",
        []
      )
    end

    if record.update(params)
      handle_plant_id_change(record, params[:plant_id]) if plant_id_changed
      handle_started_on_change(record, plant_id_changed) if started_on_changed && !plant_id_changed

      ApplicationSerializer.success(
        data: build_growth_record_response(record)
      )
    else
      raise ValidationError.new(
        "成長記録の更新に失敗しました",
        record.errors.full_messages
      )
    end
  end

  # サムネイル削除フラグの処理
  def self.handle_thumbnail_removal(record, params)
    if params[:remove_thumbnail] == "true"
      record.thumbnail.purge if record.thumbnail.attached?
      params = params.except(:remove_thumbnail)
    end
    params
  end

  # record_name 自動生成処理
  def self.handle_record_name_auto_generation(record, params)
    if params.key?(:record_name) && params[:record_name].blank?
      params = params.merge(record_name: "成長記録#{record.record_number}")
    end
    params
  end

  # 品種変更時のステップ再生成処理
  def self.handle_plant_id_change(record, new_plant_id)
    record.growth_record_steps.destroy_all

    new_guide = Guide.find_by(plant_id: new_plant_id)
    record.update(guide: new_guide) if new_guide

    regenerate_growth_record_steps(record, new_guide) if new_guide
  end

  # GrowthRecordSteps の再生成
  def self.regenerate_growth_record_steps(record, guide)
    guide_steps = guide.guide_steps.order(:position)
    checkpoint_phase = determine_checkpoint_phase(record.planting_method)

    guide_steps.each do |guide_step|
      should_complete = should_auto_complete_step?(record, guide_step, checkpoint_phase)

      record.growth_record_steps.create!(
        guide_step: guide_step,
        done: should_complete,
        completed_at: should_complete ? record.started_on : nil,
        scheduled_on: nil
      )
    end
  end

  # チェックポイントフェーズの判定
  def self.determine_checkpoint_phase(planting_method)
    case planting_method
    when "seed"
      1  # Phase 1: 種まき
    when "seedling"
      3  # Phase 3: 植え付け
    else
      nil
    end
  end

  # ステップ自動完了の判定
  def self.should_auto_complete_step?(record, guide_step, checkpoint_phase)
    record.status == "growing" &&
      checkpoint_phase &&
      guide_step.phase.present? &&
      guide_step.phase <= checkpoint_phase
  end

  # 開始日変更時の処理
  def self.handle_started_on_change(record, plant_id_changed)
    return unless record.growth_record_steps.exists?

    first_completed_step = record.growth_record_steps.where(done: true).order(:completed_at).first
    first_completed_step.update(completed_at: record.started_on) if first_completed_step

    GrowthRecordStepService.send(:recalculate_next_steps, record)
  end

  # 現在のステップ情報を計算（チェックポイント起算方式）
  def self.calculate_current_step_info(growth_record)
    return nil unless growth_record.guide

    guide_steps = growth_record.guide.guide_steps.order(:position)
    return nil if guide_steps.empty?

    case growth_record.status
    when "planning"
      # 計画中: 準備ステップ（最初のステップ）を表示
      {
        status: "planning",
        preparation_step: build_step_info(guide_steps.first, nil, growth_record),
        all_steps: guide_steps.map { |step| build_step_info(step, nil, growth_record) }
      }
    when "growing"
      # 育成中: チェックポイント起算で現在・次のステップを判定
      return nil unless growth_record.started_on

      # 基準日とステップの決定
      base_date = determine_base_date(growth_record)
      base_step_due_days = determine_base_step_due_days(growth_record)

      # 栽培方法による開始ステップフィルタリング
      visible_steps = filter_steps_by_planting_method(guide_steps, growth_record.planting_method)

      # 経過日数計算
      elapsed_days = (Date.today - base_date).to_i

      # 現在・次のステップ判定（調整後の日数で比較）
      current_step = visible_steps.reverse.find { |s| (s.due_days - base_step_due_days) <= elapsed_days }
      next_step = visible_steps.find { |s| (s.due_days - base_step_due_days) > elapsed_days }

      {
        status: "growing",
        elapsed_days: elapsed_days,
        base_date: base_date,
        current_step: current_step ? build_step_info(current_step, elapsed_days, growth_record, base_step_due_days) : nil,
        next_step: next_step ? build_step_info(next_step, elapsed_days, growth_record, base_step_due_days) : nil,
        all_steps: visible_steps.map { |step| build_step_info(step, elapsed_days, growth_record, base_step_due_days) }
      }
    when "completed", "failed"
      # 完了/失敗: 全ステップを振り返りとして表示
      total_days = if growth_record.ended_on && growth_record.started_on
        (growth_record.ended_on - growth_record.started_on).to_i
      end

      {
        status: growth_record.status,
        total_days: total_days,
        all_steps: guide_steps.map { |step| build_step_info(step, total_days, growth_record) }
      }
    end
  end

  # ステップ情報を構築（チェックポイント起算対応）
  def self.build_step_info(step, elapsed_days, growth_record, base_step_due_days = 0)
    # 成長記録ステップの取得（完了状態・完了日を取得）
    growth_record_step = growth_record.growth_record_steps.find_by(guide_step_id: step.id)

    # 調整後の目安日数（チェックポイント起算）
    adjusted_due_days = step.due_days - base_step_due_days

    info = {
      id: step.id,
      growth_record_step_id: growth_record_step&.id,
      title: step.title,
      description: step.description,
      position: step.position,
      phase: step.phase,
      due_days: step.due_days,
      adjusted_due_days: adjusted_due_days,
      done: growth_record_step&.done || false,
      completed_at: growth_record_step&.completed_at
    }

    if elapsed_days
      info[:is_current] = adjusted_due_days <= elapsed_days
      info[:is_completed] = growth_record_step&.done || false
      info[:days_until] = adjusted_due_days - elapsed_days if adjusted_due_days > elapsed_days
    end

    info
  end

  # 基準日の決定（最後に完了したステップのcompleted_at or started_on）
  def self.determine_base_date(growth_record)
    last_completed = growth_record.growth_record_steps.where(done: true).order(:completed_at).last
    last_completed&.completed_at || growth_record.started_on
  end

  # 基準ステップのdue_daysを決定（新フェーズ構造対応）
  def self.determine_base_step_due_days(growth_record)
    last_completed = growth_record.growth_record_steps.where(done: true).order(:completed_at).last
    return last_completed.guide_step.due_days if last_completed

    # ガイドがない場合は0を返す
    return 0 unless growth_record.guide

    # 完了ステップがない場合、planting_methodに応じた基準フェーズのdue_daysを取得
    guide_steps = growth_record.guide.guide_steps
    base_phase = case growth_record.planting_method
    when "seed"
      1 # Phase 1（種まき）を基準
    when "seedling"
      3 # Phase 3（植え付け）を基準
    else
      1 # デフォルトはPhase 1
    end

    base_step = guide_steps.find_by(phase: base_phase)
    base_step&.due_days || 0
  end

  # 栽培方法によるフェーズフィルタリング（新フェーズ構造対応）
  def self.filter_steps_by_planting_method(guide_steps, planting_method)
    return guide_steps if planting_method.nil?

    case planting_method
    when "seed"
      # 種から: フェーズ0（準備）, 1（種まき）, 2（育苗）, 3（植え付け）, 4（育成）, 5（追肥）, 6（収穫）
      # applicable_to が 'all', 'seed_only', 'direct_sow' のみ表示
      guide_steps.where(
        "applicable_to IN (?) OR (phase IN (?) AND applicable_to = ?)",
        [ "all", "seed_only", "direct_sow" ],
        [ 0, 1, 2, 3, 4, 5, 6 ],
        "all"
      )
    when "seedling"
      # 苗から: フェーズ0（準備）, 3（植え付け）, 4（育成）, 5（追肥）, 6（収穫）
      # applicable_to が 'all', 'seedling_only' のみ表示
      guide_steps.where(
        "(phase IN (?) AND applicable_to IN (?))",
        [ 0, 3, 4, 5, 6 ],
        [ "all", "seedling_only" ]
      )
    else
      # その他の場合は全て表示
      guide_steps
    end
  end

  # ページネーション情報構築
  def self.build_pagination_info(page, per_page, total_count)
    offset = (page - 1) * per_page
    has_more = (offset + per_page) < total_count

    {
      current_page: page,
      per_page: per_page,
      total_count: total_count,
      has_more: has_more
    }
  end

  # サムネイルURL生成
  def self.build_thumbnail_url(record)
    if record.thumbnail.attached?
      # 開発環境ではホストを含む完全なURLを返す
      if Rails.env.development?
        Rails.application.routes.url_helpers.rails_blob_url(record.thumbnail, host: "http://localhost:3001")
      else
        # 本番環境ではS3の直接URLを返す
        record.thumbnail.url
      end
    else
      nil
    end
  end
  private_class_method :build_thumbnail_url
end
