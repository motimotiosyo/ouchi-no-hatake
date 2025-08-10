# Use this file to define cron jobs
# Learn more: http://github.com/javan/whenever

# Set environment variables
env :PATH, ENV['PATH']
set :output, "/app/log/cron.log"

# Define the job
every 1.hour do
  rake "cleanup:unverified_users"
end

# Alternative: Run once per day at 2:00 AM
# every 1.day, at: '2:00 am' do
#   rake "cleanup:unverified_users"
# end