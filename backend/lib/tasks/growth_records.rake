namespace :growth_records do
  desc "Resequence all growth record numbers"
  task resequence_all: :environment do
    GrowthRecord.resequence_all
    puts "All growth records have been resequenced."
  end
end
