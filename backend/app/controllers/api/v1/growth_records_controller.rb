class Api::V1::GrowthRecordsController < ApplicationController
  before_action :authenticate_request
  before_action :set_growth_record, only: [ :show, :update, :destroy ]

  def index
    begin
      page = params[:page]&.to_i || 1
      per_page = params[:per_page]&.to_i || 10
      offset = (page - 1) * per_page

      growth_records = current_user.growth_records
        .includes(:plant)
        .order(created_at: :desc)
        .limit(per_page)
        .offset(offset)

      total_count = current_user.growth_records.count
      has_more = (offset + per_page) < total_count

      growth_records_data = growth_records.map do |record|
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

      render json: {
        growth_records: growth_records_data,
        pagination: {
          current_page: page,
          per_page: per_page,
          total_count: total_count,
          has_more: has_more
        }
      }
    rescue => e
      Rails.logger.error "Error in GrowthRecordsController#index: #{e.message}"
      Rails.logger.error e.backtrace.join("\n")
      render json: {
        error: "成長記録の取得に失敗しました"
      }, status: :internal_server_error
    end
  end

  def show
    begin
      posts = @growth_record.posts
        .includes(:user, :category)
        .order(created_at: :desc)

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

      render json: {
        growth_record: {
          id: @growth_record.id,
          record_number: @growth_record.record_number,
          record_name: @growth_record.record_name,
          location: @growth_record.location,
          started_on: @growth_record.started_on,
          ended_on: @growth_record.ended_on,
          status: @growth_record.status,
          created_at: @growth_record.created_at,
          updated_at: @growth_record.updated_at,
          plant: {
            id: @growth_record.plant.id,
            name: @growth_record.plant.name,
            description: @growth_record.plant.description
          }
        },
        posts: posts_data
      }
    rescue => e
      Rails.logger.error "Error in GrowthRecordsController#show: #{e.message}"
      Rails.logger.error e.backtrace.join("\n")
      render json: {
        error: "成長記録の詳細取得に失敗しました"
      }, status: :internal_server_error
    end
  end

  def create
    begin
      plant = Plant.find(growth_record_params[:plant_id])

      # record_numberを自動生成
      last_record = current_user.growth_records.where(plant: plant).order(:record_number).last
      next_record_number = last_record ? last_record.record_number + 1 : 1

      @growth_record = current_user.growth_records.build(growth_record_params)
      @growth_record.record_number = next_record_number

      if @growth_record.save

        render json: {
          growth_record: {
            id: @growth_record.id,
            record_number: @growth_record.record_number,
            record_name: @growth_record.record_name,
            location: @growth_record.location,
            started_on: @growth_record.started_on,
            ended_on: @growth_record.ended_on,
            status: @growth_record.status,
            created_at: @growth_record.created_at,
            updated_at: @growth_record.updated_at,
            plant: {
              id: @growth_record.plant.id,
              name: @growth_record.plant.name,
              description: @growth_record.plant.description
            }
          }
        }, status: :created
      else
        render json: {
          error: "成長記録の作成に失敗しました",
          details: @growth_record.errors.full_messages
        }, status: :unprocessable_entity
      end
    rescue ActiveRecord::RecordNotFound
      render json: {
        error: "指定された植物が見つかりません"
      }, status: :not_found
    rescue => e
      Rails.logger.error "Error in GrowthRecordsController#create: #{e.message}"
      Rails.logger.error e.backtrace.join("\n")
      render json: {
        error: "成長記録の作成に失敗しました"
      }, status: :internal_server_error
    end
  end

  def update
    begin
      if @growth_record.update(growth_record_params)
        render json: {
          growth_record: {
            id: @growth_record.id,
            record_number: @growth_record.record_number,
            record_name: @growth_record.record_name,
            location: @growth_record.location,
            started_on: @growth_record.started_on,
            ended_on: @growth_record.ended_on,
            status: @growth_record.status,
            created_at: @growth_record.created_at,
            updated_at: @growth_record.updated_at,
            plant: {
              id: @growth_record.plant.id,
              name: @growth_record.plant.name,
              description: @growth_record.plant.description
            }
          }
        }
      else
        render json: {
          error: "成長記録の更新に失敗しました",
          details: @growth_record.errors.full_messages
        }, status: :unprocessable_entity
      end
    rescue => e
      Rails.logger.error "Error in GrowthRecordsController#update: #{e.message}"
      Rails.logger.error e.backtrace.join("\n")
      render json: {
        error: "成長記録の更新に失敗しました"
      }, status: :internal_server_error
    end
  end

  def destroy
    begin
      @growth_record.destroy
      render json: { message: "成長記録を削除しました" }
    rescue => e
      Rails.logger.error "Error in GrowthRecordsController#destroy: #{e.message}"
      Rails.logger.error e.backtrace.join("\n")
      render json: {
        error: "成長記録の削除に失敗しました"
      }, status: :internal_server_error
    end
  end

  private

  def set_growth_record
    @growth_record = current_user.growth_records.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: {
      error: "成長記録が見つかりません"
    }, status: :not_found
  end

  def growth_record_params
    params.require(:growth_record).permit(:plant_id, :record_name, :location, :started_on, :ended_on, :status)
  end
end
