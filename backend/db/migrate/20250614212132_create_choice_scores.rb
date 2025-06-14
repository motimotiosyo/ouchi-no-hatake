class CreateChoiceScores < ActiveRecord::Migration[7.2]
  def change
    create_table :choice_scores do |t|
      t.references :choice, null: false, foreign_key: true
      t.references :plant, null: false, foreign_key: true
      t.integer :score

      t.timestamps
    end
  end
end
