class Api::V1::NotificationsController < ApplicationController
  # GET /api/v1/notifications
  def index
    page = params[:page]&.to_i || 1
    per_page = 20

    notifications = current_user.notifications
      .includes(:actor, :notifiable)
      .recent
      .limit(per_page)
      .offset((page - 1) * per_page)

    total_count = current_user.notifications.count

    render json: ApplicationSerializer.success(
      data: {
        notifications: notifications.map { |n| build_notification_response(n) },
        pagination: {
          current_page: page,
          per_page: per_page,
          total_count: total_count,
          total_pages: (total_count.to_f / per_page).ceil
        }
      }
    )
  rescue => e
    Rails.logger.error "Error in NotificationsController#index: #{e.message}"
    render json: ApplicationSerializer.error(
      message: "通知一覧の取得に失敗しました",
      code: "INTERNAL_SERVER_ERROR"
    ), status: :internal_server_error
  end

  # GET /api/v1/notifications/unread_count
  def unread_count
    count = current_user.notifications.unread.count

    render json: ApplicationSerializer.success(
      data: { unread_count: count }
    )
  rescue => e
    Rails.logger.error "Error in NotificationsController#unread_count: #{e.message}"
    render json: ApplicationSerializer.error(
      message: "未読数の取得に失敗しました",
      code: "INTERNAL_SERVER_ERROR"
    ), status: :internal_server_error
  end

  # PATCH /api/v1/notifications/:id/read
  def mark_as_read
    notification = current_user.notifications.find(params[:id])
    notification.mark_as_read!

    render json: ApplicationSerializer.success(
      data: { message: "通知を既読にしました" }
    )
  rescue ActiveRecord::RecordNotFound
    render json: ApplicationSerializer.error(
      message: "通知が見つかりません",
      code: "NOT_FOUND"
    ), status: :not_found
  rescue => e
    Rails.logger.error "Error in NotificationsController#mark_as_read: #{e.message}"
    render json: ApplicationSerializer.error(
      message: "既読化に失敗しました",
      code: "INTERNAL_SERVER_ERROR"
    ), status: :internal_server_error
  end

  # PATCH /api/v1/notifications/read_all
  def mark_all_as_read
    current_user.notifications.unread.update_all(read: true)

    render json: ApplicationSerializer.success(
      data: { message: "全ての通知を既読にしました" }
    )
  rescue => e
    Rails.logger.error "Error in NotificationsController#mark_all_as_read: #{e.message}"
    render json: ApplicationSerializer.error(
      message: "一括既読化に失敗しました",
      code: "INTERNAL_SERVER_ERROR"
    ), status: :internal_server_error
  end

  private

  def build_notification_response(notification)
    {
      id: notification.id,
      notification_type: notification.notification_type,
      message: notification.message,
      read: notification.read,
      created_at: notification.created_at,
      actor: {
        id: notification.actor.id,
        name: notification.actor.name
      },
      notifiable: build_notifiable_info(notification)
    }
  end

  def build_notifiable_info(notification)
    case notification.notifiable_type
    when "Post"
      { type: "Post", id: notification.notifiable_id }
    when "Comment"
      { type: "Comment", id: notification.notifiable_id, post_id: notification.notifiable.post_id }
    when "GrowthRecord"
      { type: "GrowthRecord", id: notification.notifiable_id }
    else
      { type: notification.notifiable_type, id: notification.notifiable_id }
    end
  end
end
