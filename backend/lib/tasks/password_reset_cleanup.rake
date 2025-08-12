namespace :password_reset do
  desc "期限切れパスワードリセットトークンをクリーンアップ"
  task cleanup: :environment do
    count = PasswordResetToken.cleanup_expired
    puts "#{count}個の期限切れパスワードリセットトークンを削除しました"
  end
end
