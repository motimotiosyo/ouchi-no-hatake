class Api::V1::PostsController < ApplicationController
  skip_before_action :authenticate_request, only: [ :index ]
  skip_before_action :check_email_verification, only: [ :index ]
  before_action :set_post, only: [ :update, :destroy ]

  def index
    begin
      page = params[:page]&.to_i || 1
      per_page = params[:per_page]&.to_i || 10
      offset = (page - 1) * per_page

      posts = Post.timeline.limit(per_page).offset(offset)
      total_count = Post.count
      has_more = (offset + per_page) < total_count

    posts_data = posts.map do |post|
      post_data = {
        id: post.id,
        title: post.title,
        content: post.content,
        post_type: post.post_type,
        created_at: post.created_at,
        user: {
          id: post.user.id,
          name: post.user.name
        }
      }

      # カテゴリがある場合のみ追加
      if post.category
        post_data[:category] = {
          id: post.category.id,
          name: post.category.name
        }
      end

      # 成長記録がある場合のみ追加
      if post.growth_record
        post_data[:growth_record] = {
          id: post.growth_record.id,
          record_name: post.growth_record.record_name,
          plant: {
            id: post.growth_record.plant.id,
            name: post.growth_record.plant.name
          }
        }
      end

      # 画像URLを追加
      if post.images.attached?
        post_data[:images] = post.images.map { |image| Rails.application.routes.url_helpers.url_for(image) }
      else
        post_data[:images] = []
      end

      post_data
    end

      render json: {
        posts: posts_data,
        pagination: {
          current_page: page,
          per_page: per_page,
          total_count: total_count,
          has_more: has_more
        }
      }
    rescue => e
      Rails.logger.error "Error in PostsController#index: #{e.message}"
      Rails.logger.error e.backtrace.join("\n")
      render json: {
        posts: [],
        pagination: {
          current_page: 1,
          per_page: per_page,
          total_count: 0,
          has_more: false
        }
      }
    end
  end

  def create
    begin
      # リクエストの生データをチェックしてmultipart/form-dataかどうか判定
      raw_body = request.raw_post
      Rails.logger.debug "Content-Type: #{request.content_type}"
      Rails.logger.debug "Raw body starts with: #{raw_body[0..100]}"
      
      # 実際のボディ内容でmultipart判定（Content-Typeが誤認識される場合があるため）
      is_multipart = raw_body.include?('------WebKit') || raw_body.include?('Content-Disposition: form-data')
      
      if is_multipart
        Rails.logger.debug "Processing multipart/form-data request (detected from body)"
        post_attributes = extract_post_params_from_multipart
      else
        Rails.logger.debug "Processing regular request"
        post_attributes = post_params
      end
      
      Rails.logger.debug "Extracted post attributes: #{post_attributes.inspect}"
      @post = current_user.posts.build(post_attributes)

      if @post.save
        post_response = {
          id: @post.id,
          title: @post.title,
          content: @post.content,
          post_type: @post.post_type,
          created_at: @post.created_at,
          updated_at: @post.updated_at,
          user: {
            id: @post.user.id,
            name: @post.user.name
          }
        }

        # カテゴリがある場合のみ追加
        if @post.category
          post_response[:category] = {
            id: @post.category.id,
            name: @post.category.name
          }
        end

        # 成長記録がある場合のみ追加
        if @post.growth_record
          post_response[:growth_record] = {
            id: @post.growth_record.id,
            record_name: @post.growth_record.record_name,
            plant: {
              id: @post.growth_record.plant.id,
              name: @post.growth_record.plant.name
            }
          }
        end

        # 画像URLを追加
        if @post.images.attached?
          post_response[:images] = @post.images.map { |image| Rails.application.routes.url_helpers.url_for(image) }
        else
          post_response[:images] = []
        end

        render json: { post: post_response }, status: :created
      else
        Rails.logger.error "Post validation failed: #{@post.errors.full_messages.join(', ')}"
        Rails.logger.error "Post attributes: #{@post.attributes.inspect}"
        render json: {
          error: "投稿の作成に失敗しました",
          details: @post.errors.full_messages
        }, status: :unprocessable_entity
      end
    rescue ActiveRecord::RecordNotFound => e
      render json: {
        error: "指定された成長記録またはカテゴリが見つかりません"
      }, status: :not_found
    rescue => e
      Rails.logger.error "Error in PostsController#create: #{e.message}"
      Rails.logger.error e.backtrace.join("\n")
      render json: {
        error: "投稿の作成に失敗しました"
      }, status: :internal_server_error
    end
  end

  def update
    begin
      if @post.update(post_params)
        post_response = {
          id: @post.id,
          title: @post.title,
          content: @post.content,
          post_type: @post.post_type,
          created_at: @post.created_at,
          updated_at: @post.updated_at,
          user: {
            id: @post.user.id,
            name: @post.user.name
          }
        }

        # カテゴリがある場合のみ追加
        if @post.category
          post_response[:category] = {
            id: @post.category.id,
            name: @post.category.name
          }
        end

        # 成長記録がある場合のみ追加
        if @post.growth_record
          post_response[:growth_record] = {
            id: @post.growth_record.id,
            record_name: @post.growth_record.record_name,
            plant: {
              id: @post.growth_record.plant.id,
              name: @post.growth_record.plant.name
            }
          }
        end

        # 画像URLを追加
        if @post.images.attached?
          post_response[:images] = @post.images.map { |image| Rails.application.routes.url_helpers.url_for(image) }
        else
          post_response[:images] = []
        end

        render json: { post: post_response }
      else
        render json: {
          error: "投稿の更新に失敗しました",
          details: @post.errors.full_messages
        }, status: :unprocessable_entity
      end
    rescue ActiveRecord::RecordNotFound => e
      render json: {
        error: "指定された成長記録またはカテゴリが見つかりません"
      }, status: :not_found
    rescue => e
      Rails.logger.error "Error in PostsController#update: #{e.message}"
      Rails.logger.error e.backtrace.join("\n")
      render json: {
        error: "投稿の更新に失敗しました"
      }, status: :internal_server_error
    end
  end

  def destroy
    begin
      @post.destroy
      render json: { message: "投稿を削除しました" }
    rescue => e
      Rails.logger.error "Error in PostsController#destroy: #{e.message}"
      Rails.logger.error e.backtrace.join("\n")
      render json: {
        error: "投稿の削除に失敗しました"
      }, status: :internal_server_error
    end
  end

  private

  def set_post
    @post = current_user.posts.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: {
      error: "投稿が見つかりません"
    }, status: :not_found
  end

  def extract_post_params_from_multipart
    # リクエストボディを直接読み取り
    request_body = request.raw_post
    Rails.logger.debug "Raw request body length: #{request_body.length}"
    
    # multipart/form-dataを手動解析
    post_attrs = {}
    images = []
    
    # 境界を取得（Content-Typeから取得できない場合は実際のボディから抽出）
    boundary = nil
    if request.content_type&.include?('boundary=')
      boundary = request.content_type.match(/boundary=(.+)$/)[1] rescue nil
    end
    
    # Content-Typeから境界が取得できない場合、実際のボディから抽出
    if boundary.nil?
      if match = request_body.match(/^--(.*?)(?:\r\n|\n)/)
        boundary = match[1]
        Rails.logger.debug "Extracted boundary from body: #{boundary}"
      end
    end
    
    return {} unless boundary
    
    # パートごとに分割して処理
    parts = request_body.split("--#{boundary}")
    
    parts.each do |part|
      next if part.strip.empty? || part.strip == '--'
      
      # ヘッダー部分とボディ部分を分割
      header_end = part.index("\r\n\r\n") || part.index("\n\n")
      next unless header_end
      
      headers = part[0...header_end]
      body = part[(header_end + 4)..-1]
      body = body.chomp("\r\n") if body&.end_with?("\r\n")
      
      # Content-Dispositionヘッダーから名前を抽出
      if match = headers.match(/name="post\[([^\]]+)\]"/)
        field_name = match[1]
        Rails.logger.debug "Processing field: #{field_name}, value: #{body&.strip}"
        
        # バイナリデータ（画像など）をスキップ
        if headers.include?('Content-Type: image/')
          Rails.logger.debug "Skipping binary image data for field: #{field_name}"
          next
        end
        
        case field_name
        when 'title', 'content', 'post_type'
          post_attrs[field_name.to_sym] = body&.strip
        when 'growth_record_id', 'category_id'
          post_attrs[field_name.to_sym] = body.to_i if body.present? && body.strip.present?
        when 'images'
          # 画像ファイルの場合は今回スキップ
          Rails.logger.debug "Image field detected, skipping for now"
        end
      end
    end
    
    post_attrs[:images] = images if images.any?
    Rails.logger.debug "Extracted post attributes: #{post_attrs.inspect}"
    
    post_attrs
  rescue => e
    Rails.logger.error "Error extracting multipart params: #{e.message}"
    Rails.logger.error e.backtrace.join("\n")
    {}
  end

  def post_params
    Rails.logger.debug "Available params keys: #{params.keys.inspect}"
    Rails.logger.debug "Post params: #{params[:post]&.inspect}"
    params.require(:post).permit(:title, :content, :growth_record_id, :category_id, :post_type, images: [])
  rescue ActionController::ParameterMissing => e
    Rails.logger.error "Parameter missing error: #{e.message}"
    Rails.logger.error "All params: #{params.inspect}"
    raise e
  end
end
