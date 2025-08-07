namespace :users do
  desc "期限切れの未認証ユーザーを削除"
  task cleanup_expired: :environment do
    puts "期限切れユーザーのクリーンアップを開始..."

    # 24時間経過した未認証ユーザーを取得
    expired_users = User.unverified_expired
    count = expired_users.count

    if count.zero?
      puts "削除対象の期限切れユーザーは見つかりませんでした"
    else
      puts "#{count}件の期限切れユーザーを削除します"

      # バッチで削除実行
      expired_users.destroy_all

      puts "期限切れユーザーの削除が完了しました（#{count}件削除）"
    end
  end

  desc "未認証ユーザーの状況を確認"
  task status: :environment do
    total_users = User.count
    verified_users = User.where(email_verified: true).count
    unverified_users = User.where(email_verified: false).count
    expired_users = User.unverified_expired.count

    puts "=== ユーザー認証状況 ==="
    puts "総ユーザー数: #{total_users}"
    puts "認証済みユーザー: #{verified_users}"
    puts "未認証ユーザー: #{unverified_users}"
    puts "期限切れ未認証ユーザー: #{expired_users}"

    if expired_users > 0
      puts "\n期限切れユーザーを削除するには以下のコマンドを実行してください:"
      puts "rails users:cleanup_expired"
    end
  end
end
