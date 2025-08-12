class UserMailer < ApplicationMailer
  def email_verification(user, verification_url)
    @user = user
    @verification_url = verification_url

    mail(
      to: @user.email,
      subject: "【おうちの畑】メールアドレス認証のお願い",
      from: "ouchi.no.hatake@gmail.com"
    )
  end

  def password_reset(user, reset_url)
    @user = user
    @reset_url = reset_url

    mail(
      to: @user.email,
      subject: "【おうちの畑】パスワードリセットのご案内",
      from: "ouchi.no.hatake@gmail.com"
    )
  end
end
