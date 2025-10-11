class Api::V1::FollowsController < ApplicationController
  # フォロー作成
  def create
    followee = User.find(params[:user_id])
    result = FollowService.follow(followee, current_user)
    render json: result, status: :created

  rescue FollowService::SelfFollowError => e
    render json: ApplicationSerializer.error(
      message: e.message,
      code: "SELF_FOLLOW_ERROR"
    ), status: :unprocessable_entity
  rescue FollowService::AlreadyFollowingError => e
    render json: ApplicationSerializer.error(
      message: e.message,
      code: "ALREADY_FOLLOWING"
    ), status: :unprocessable_entity
  rescue FollowService::ValidationError => e
    render json: ApplicationSerializer.error(
      message: e.message,
      code: "VALIDATION_ERROR",
      details: e.details
    ), status: :unprocessable_entity
  rescue ActiveRecord::RecordNotFound
    render json: ApplicationSerializer.error(
      message: "ユーザーが見つかりません",
      code: "NOT_FOUND"
    ), status: :not_found
  rescue => e
    Rails.logger.error "Error in FollowsController#create: #{e.message}"
    Rails.logger.error e.backtrace.join("\n")
    render json: ApplicationSerializer.error(
      message: "フォローに失敗しました",
      code: "INTERNAL_SERVER_ERROR"
    ), status: :internal_server_error
  end

  # フォロー解除
  def destroy
    followee = User.find(params[:user_id])
    result = FollowService.unfollow(followee, current_user)
    render json: result, status: :ok

  rescue FollowService::ValidationError => e
    render json: ApplicationSerializer.error(
      message: e.message,
      code: "VALIDATION_ERROR"
    ), status: :unprocessable_entity
  rescue ActiveRecord::RecordNotFound
    render json: ApplicationSerializer.error(
      message: "ユーザーが見つかりません",
      code: "NOT_FOUND"
    ), status: :not_found
  rescue => e
    Rails.logger.error "Error in FollowsController#destroy: #{e.message}"
    Rails.logger.error e.backtrace.join("\n")
    render json: ApplicationSerializer.error(
      message: "フォロー解除に失敗しました",
      code: "INTERNAL_SERVER_ERROR"
    ), status: :internal_server_error
  end

  # フォロワー一覧
  def followers
    user = User.find(params[:user_id])
    followers = user.followers

    render json: ApplicationSerializer.success(
      data: {
        followers: followers.map { |u| build_user_response(u, current_user) },
        total_count: user.followers_count
      }
    )
  rescue ActiveRecord::RecordNotFound
    render json: ApplicationSerializer.error(
      message: "ユーザーが見つかりません",
      code: "NOT_FOUND"
    ), status: :not_found
  rescue => e
    Rails.logger.error "Error in FollowsController#followers: #{e.message}"
    Rails.logger.error e.backtrace.join("\n")
    render json: ApplicationSerializer.error(
      message: "フォロワー一覧の取得に失敗しました",
      code: "INTERNAL_SERVER_ERROR"
    ), status: :internal_server_error
  end

  # フォロー中一覧
  def following
    user = User.find(params[:user_id])
    following = user.following

    render json: ApplicationSerializer.success(
      data: {
        following: following.map { |u| build_user_response(u, current_user) },
        total_count: user.following_count
      }
    )
  rescue ActiveRecord::RecordNotFound
    render json: ApplicationSerializer.error(
      message: "ユーザーが見つかりません",
      code: "NOT_FOUND"
    ), status: :not_found
  rescue => e
    Rails.logger.error "Error in FollowsController#following: #{e.message}"
    Rails.logger.error e.backtrace.join("\n")
    render json: ApplicationSerializer.error(
      message: "フォロー中一覧の取得に失敗しました",
      code: "INTERNAL_SERVER_ERROR"
    ), status: :internal_server_error
  end

  private

  def build_user_response(user, current_user)
    UserService.build_user_response(user, current_user)
  end
end
