require "test_helper"

class UserMailerTest < ActionMailer::TestCase
  test "email_verification" do
    user = User.create!(
      name: "Test User",
      email: "test@example.com",
      password: "password123"
    )
    verification_url = "http://localhost:3001/verify-email?token=test_token"
    
    mail = UserMailer.email_verification(user, verification_url)
    
    assert_equal "【おうちの畑】メールアドレス認証のお願い", mail.subject
    assert_equal [ "test@example.com" ], mail.to
    assert_equal [ "ouchi.no.hatake@gmail.com" ], mail.from
    assert_match "認証", mail.body.encoded
  end
end
