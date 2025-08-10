namespace :cleanup do
  desc "Delete unverified users older than 24 hours"
  task unverified_users: :environment do
    Rails.logger.info "[#{Time.current}] Starting cleanup of unverified users..."

    begin
      # 削除対象のユーザーを取得
      expired_users = User.unverified_expired
      user_count = expired_users.count

      Rails.logger.info "[#{Time.current}] Found #{user_count} expired unverified users to delete"

      if user_count > 0
        # 削除対象ユーザーの詳細をログに記録
        expired_users.find_each do |user|
          Rails.logger.info "[#{Time.current}] Deleting user: ID=#{user.id}, Email=#{user.email}, Created=#{user.created_at}, Verification_sent=#{user.email_verification_sent_at}"
        end

        # 一括削除実行
        deleted_count = expired_users.delete_all

        Rails.logger.info "[#{Time.current}] Successfully deleted #{deleted_count} unverified users"
        puts "✅ Cleanup completed: #{deleted_count} expired unverified users deleted"
      else
        Rails.logger.info "[#{Time.current}] No expired unverified users found"
        puts "✅ Cleanup completed: No expired unverified users to delete"
      end

    rescue StandardError => e
      error_message = "Failed to cleanup unverified users: #{e.message}"
      Rails.logger.error "[#{Time.current}] #{error_message}"
      Rails.logger.error "[#{Time.current}] Backtrace: #{e.backtrace.join("\n")}"

      puts "❌ Error: #{error_message}"
      raise e
    end

    Rails.logger.info "[#{Time.current}] Cleanup task completed"
  end
end
