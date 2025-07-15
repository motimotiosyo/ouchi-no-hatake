# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Example:
#
#   ["Action", "Comedy", "Drama", "Horror"].each do |genre_name|
#     MovieGenre.find_or_create_by!(name: genre_name)
#   end

# ベランダ・室内栽培可能な植物データ
plants_data = [
  {
    name: "ミニトマト",
    description: "プランターで育てやすく、初心者におすすめ。支柱を立てて育てます。"
  },
  {
    name: "きゅうり",
    description: "支柱やネットがあれば縦に育つため、省スペースで栽培可能。"
  },
  {
    name: "ピーマン",
    description: "小さなプランターでも栽培でき、長期間収穫を楽しめます。"
  },
  {
    name: "レタス",
    description: "短期間で収穫でき、室内やベランダで簡単に育てられます。"
  },
  {
    name: "小松菜",
    description: "成長が早く育てやすい葉物野菜。プランターで手軽に栽培できます。"
  },
  {
    name: "水菜",
    description: "室内でも育ち、サラダに最適。短期間で収穫できます。"
  },
  {
    name: "ラディッシュ（二十日大根）",
    description: "小さなプランターでも育ち、約20日で収穫できる手軽な野菜。"
  },
  {
    name: "ベビーリーフ",
    description: "室内栽培に最適。若い葉を摘み取って長期間楽しめます。"
  },
  {
    name: "バジル",
    description: "室内栽培で人気のハーブ。料理の香り付けに重宝します。"
  },
  {
    name: "パセリ",
    description: "長期間収穫可能なハーブ。プランターで簡単に育てられます。"
  },
  {
    name: "青じそ",
    description: "日本の家庭菜園定番のハーブ。薬味として重宝します。"
  }
]

plants_data.each do |plant_data|
  Plant.find_or_create_by!(name: plant_data[:name]) do |plant|
    plant.description = plant_data[:description]
  end
end

puts "植物データの登録が完了しました。"
