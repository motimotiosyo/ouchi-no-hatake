class AddCalendarFieldsToGuides < ActiveRecord::Migration[7.2]
  def change
    add_column :guides, :planting_months, :string
    add_column :guides, :transplanting_months, :string
    add_column :guides, :pruning_months, :string
    add_column :guides, :fertilizing_months, :string
    add_column :guides, :harvesting_months, :string
  end
end
