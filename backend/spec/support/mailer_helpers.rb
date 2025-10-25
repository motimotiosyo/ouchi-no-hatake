RSpec.configure do |config|
  config.before(:each, type: :request) do
    # Stub mailer to prevent actual email sending (cost reduction for paid email service)
    allow(UserMailer).to receive_message_chain(:email_verification, :deliver_later).and_return(true)
    allow(UserMailer).to receive_message_chain(:password_reset, :deliver_later).and_return(true)
  end
end
