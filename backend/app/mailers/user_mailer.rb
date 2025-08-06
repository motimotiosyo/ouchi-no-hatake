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
end
