class CreateUserProviders < ActiveRecord::Migration[7.2]
  def change
    create_table :user_providers do |t|
      t.references :user, null: false, foreign_key: true
      t.string :provider, null: false
      t.string :uid, null: false
      t.string :email
      t.text :access_token
      t.text :refresh_token
      t.datetime :expires_at

      t.timestamps
    end

    add_index :user_providers, [ :provider, :uid ], unique: true
  end
end
