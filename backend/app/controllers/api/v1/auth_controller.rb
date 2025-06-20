class Api::V1::AuthController < ApplicationController
  include ExceptionHandler

  def register
    user = User.create!(user_params)
    token = JsonWebToken.encode(user_id: user.id)

    render json:{
      message: 'ユーザー登録が完了しました',
      token: token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    },status: :created
  end

  private
  def user_params
    params.require(:user).permit(:email, :password, :password_confirmation, :name)
  end
end