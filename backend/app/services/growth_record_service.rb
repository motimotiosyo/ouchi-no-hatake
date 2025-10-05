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
  def self.build_growth_record_response(record)
    {
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
      }
    }
  end

  # 成長記録詳細レスポンス構築（投稿データ付き）
  def self.build_growth_record_detail(record, posts)
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
      growth_record: build_growth_record_response(record).merge(
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

    # record_numberを自動生成
    last_record = user.growth_records.where(plant: plant).order(:record_number).last
    next_record_number = last_record ? last_record.record_number + 1 : 1

    growth_record = user.growth_records.build(params)
    growth_record.record_number = next_record_number

    # record_name が空の場合、自動生成
    if params[:record_name].blank?
      growth_record.record_name = "成長記録#{next_record_number}"
    end

    if growth_record.save
      OpenStruct.new(
        success: true,
        growth_record: growth_record,
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
    # record_name をクリア（空文字列）した場合も自動生成
    if params.key?(:record_name) && params[:record_name].blank?
      params = params.merge(record_name: "成長記録#{record.record_number}")
    end

    if record.update(params)
      OpenStruct.new(
        success: true,
        growth_record: record,
        data: build_growth_record_response(record)
      )
    else
      raise ValidationError.new(
        "成長記録の更新に失敗しました",
        record.errors.full_messages
      )
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
end
