class Api::V1::AuthController < ApplicationController

  # POST /api/v1/auth/register
  def register
    user = User.create!(user_params)
    token = JsonWebToken.encode(user_id: user.id)

    render json: {
      message: "ユーザー登録が完了しました",
      token: token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    }, status: :created
  end

  # POST /api/v1/auth/login
  def login
    # アドレスでユーザー検索
    user = User.find_by(email: params[:email]&.downcase)

    # パスワード検証
    if user&.authenticate(params[:password])
      # 認証成功時にJWTトークン発行
      token = JsonWebToken.encode(user_id: user.id)
      # 成功レスポンス返却
      render json: {
        message: 'ログインに成功しました',
        token: token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name
        }
      }, status: :ok
    else
      # 失敗時に例外処理
      raise ExceptionHandler::AuthenticationError, 'メールアドレスまたはパスワードが正しくありません'
    end
  end

  private
  def user_params
    params.require(:user).permit(:email, :password, :password_confirmation, :name)
  end
end
