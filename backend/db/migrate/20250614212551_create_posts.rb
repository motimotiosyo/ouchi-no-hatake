class CreatePosts < ActiveRecord::Migration[7.2]
  def change
    create_table :posts do |t|
      t.references :user, null: false, foreign_key: true
      t.references :growth_record, null: false, foreign_key: true
      t.references :category, null: false, foreign_key: true
      t.string :title
      t.text :content
      t.integer :destination_type

      t.timestamps
    end
  end
end
