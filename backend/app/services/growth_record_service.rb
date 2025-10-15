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
  def self.build_growth_records_list(growth_records, pagination_info)
    growth_records_data = growth_records.map { |record| build_growth_record_response(record) }

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
      started_on: record.started_on,
      ended_on: record.ended_on,
      status: record.status,
      created_at: record.created_at,
      updated_at: record.updated_at,
      plant: {
        id: record.plant.id,
        name: record.plant.name,
        description: record.plant.description
      },
      thumbnail_url: build_thumbnail_url(record),
      favorites_count: record.favorites_count,
      favorited_by_current_user: current_user ? record.favorited_by?(current_user) : false
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
    plant = Plant.find(params[:plant_id])

    # シーケンステーブルから次の番号を取得（単調増加、再利用しない）
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
    # サムネイル削除フラグの処理
    if params[:remove_thumbnail] == "true"
      record.thumbnail.purge if record.thumbnail.attached?
      params = params.except(:remove_thumbnail)
    end

    # record_name をクリア（空文字列）した場合も自動生成
    if params.key?(:record_name) && params[:record_name].blank?
      params = params.merge(record_name: "成長記録#{record.record_number}")
    end

    if record.update(params)
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

  # 現在のステップ情報を計算
  def self.calculate_current_step_info(growth_record)
    return nil unless growth_record.guide

    guide_steps = growth_record.guide.guide_steps.order(:position)
    return nil if guide_steps.empty?

    case growth_record.status
    when "planning"
      # 計画中: 準備ステップ（最初のステップ）を表示
      {
        status: "planning",
        preparation_step: build_step_info(guide_steps.first, nil),
        all_steps: guide_steps.map { |step| build_step_info(step, nil) }
      }
    when "growing"
      # 育成中: 経過日数から現在・次のステップを判定
      return nil unless growth_record.started_on

      elapsed_days = (Date.today - growth_record.started_on).to_i
      current_step = guide_steps.reverse.find { |s| s.due_days <= elapsed_days }
      next_step = guide_steps.find { |s| s.due_days > elapsed_days }

      {
        status: "growing",
        elapsed_days: elapsed_days,
        current_step: current_step ? build_step_info(current_step, elapsed_days) : nil,
        next_step: next_step ? build_step_info(next_step, elapsed_days) : nil,
        all_steps: guide_steps.map { |step| build_step_info(step, elapsed_days) }
      }
    when "completed", "failed"
      # 完了/失敗: 全ステップを振り返りとして表示
      total_days = if growth_record.ended_on && growth_record.started_on
        (growth_record.ended_on - growth_record.started_on).to_i
      end

      {
        status: growth_record.status,
        total_days: total_days,
        all_steps: guide_steps.map { |step| build_step_info(step, total_days) }
      }
    end
  end

  # ステップ情報を構築
  def self.build_step_info(step, elapsed_days)
    info = {
      id: step.id,
      title: step.title,
      description: step.description,
      position: step.position,
      due_days: step.due_days
    }

    if elapsed_days
      info[:is_current] = step.due_days <= elapsed_days
      info[:is_completed] = step.due_days < elapsed_days
      info[:days_until] = step.due_days - elapsed_days if step.due_days > elapsed_days
    end

    info
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
        Rails.application.routes.url_helpers.rails_blob_path(record.thumbnail, only_path: true)
      end
    else
      nil
    end
  end
  private_class_method :build_thumbnail_url
end
