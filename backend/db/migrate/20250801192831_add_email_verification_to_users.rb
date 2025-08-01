class AddEmailVerificationToUsers < ActiveRecord::Migration[7.2]
  def change
    add_column :users, :email_verified, :boolean, default: false, null: false
    add_column :users, :email_verification_token, :string
    add_column :users, :email_verification_sent_at, :datetime

    add_index :users, :email_verification_token, unique: true
  end
end
