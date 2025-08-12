class CreatePasswordResetTokens < ActiveRecord::Migration[7.2]
  def change
    create_table :password_reset_tokens do |t|
      t.string :email, null: false
      t.string :token, null: false
      t.datetime :expires_at, null: false

      t.timestamps
    end

    add_index :password_reset_tokens, :token, unique: true
    add_index :password_reset_tokens, :email
    add_index :password_reset_tokens, :expires_at
  end
end
