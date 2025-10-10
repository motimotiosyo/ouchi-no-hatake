# frozen_string_literal: true

class UserService < ApplicationService
  class ValidationError < StandardError
    attr_reader :details

    def initialize(message, details = nil)
      super(message)
      @details = details
    end
  end

  class AuthorizationError < StandardError; end

  def self.update_profile(user, params)
    # remove_avatar フラグの処理
    if params[:remove_avatar] == "true"
      user.avatar.purge if user.avatar.attached?
      params = params.except(:remove_avatar)
    end

    if user.update(params.slice(:name, :bio, :avatar))
      avatar_url = build_avatar_url(user)

      ApplicationSerializer.success(
        data: {
          user: {
            id: user.id,
            name: user.name,
            bio: user.bio,
            avatar_url: avatar_url
          }
        }
      )
    else
      raise ValidationError.new(
        "プロフィールの更新に失敗しました",
        user.errors.full_messages
      )
    end
  end

  def self.build_avatar_url(user)
    return nil unless user.avatar.attached?

    if Rails.env.development?
      Rails.application.routes.url_helpers.rails_blob_url(user.avatar, host: "http://localhost:3001")
    else
      Rails.application.routes.url_helpers.rails_blob_path(user.avatar, only_path: true)
    end
  end
  private_class_method :build_avatar_url
end
