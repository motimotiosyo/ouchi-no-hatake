# 育て方ガイドデータ

# 既存の植物を取得
plants = Plant.all.index_by(&:name)

# ガイドデータ（全23品種）
guides_data = {
  "ミニトマト" => [
    { title: "種まき・苗の準備", description: "ポットに種をまくか、苗を購入します。本葉が4〜5枚になったら植え付けの適期です。", position: 1, due_days: 0 },
    { title: "植え付け", description: "深めのプランター（30cm以上）に植え付け、支柱を立てます。", position: 2, due_days: 7 },
    { title: "わき芽かき", description: "主枝と葉の間から出るわき芽を摘み取ります。週に1回程度チェックしましょう。", position: 3, due_days: 21 },
    { title: "追肥", description: "実がつき始めたら2週間に1回程度追肥します。", position: 4, due_days: 35 },
    { title: "収穫", description: "実が赤く色づいたら収穫の適期です。ヘタの近くから丁寧に摘み取ります。", position: 5, due_days: 60 }
  ],
  "きゅうり" => [
    { title: "種まき・苗の準備", description: "ポットに種をまくか、苗を購入します。本葉が3〜4枚になったら植え付けの適期です。", position: 1, due_days: 0 },
    { title: "植え付け", description: "深めのプランターに植え付け、支柱やネットを設置します。", position: 2, due_days: 7 },
    { title: "摘芯・整枝", description: "親づるの先端を摘み、子づるを2〜3本伸ばします。", position: 3, due_days: 21 },
    { title: "追肥", description: "実がつき始めたら1週間に1回程度追肥します。", position: 4, due_days: 30 },
    { title: "収穫", description: "実が18〜20cmになったら収穫します。早めに収穫すると次々と実がつきます。", position: 5, due_days: 50 }
  ],
  "ピーマン" => [
    { title: "苗の準備", description: "苗を購入します。本葉が8〜10枚、蕾がついた苗を選びましょう。", position: 1, due_days: 0 },
    { title: "植え付け", description: "深めのプランター（25cm以上）に植え付け、支柱を立てます。", position: 2, due_days: 7 },
    { title: "整枝", description: "一番花のすぐ下のわき芽2本を残し、3本仕立てにします。", position: 3, due_days: 21 },
    { title: "追肥", description: "実がつき始めたら2週間に1回程度追肥します。", position: 4, due_days: 35 },
    { title: "収穫", description: "実が緑色でツヤが出てきたら収穫できます。長期間収穫を楽しめます。", position: 5, due_days: 60 }
  ],
  "レタス" => [
    { title: "種まき", description: "プランターに直まきするか、ポットで育苗します。", position: 1, due_days: 0 },
    { title: "間引き", description: "本葉が2〜3枚になったら、株間を10〜15cmに間引きます。", position: 2, due_days: 14 },
    { title: "追肥", description: "本葉が5〜6枚になったら追肥します。", position: 3, due_days: 25 },
    { title: "収穫", description: "外側の葉から順に収穫するか、株ごと収穫します。", position: 4, due_days: 40 }
  ],
  "小松菜" => [
    { title: "種まき", description: "プランターに直まきします。種を薄くばらまきます。", position: 1, due_days: 0 },
    { title: "間引き", description: "本葉が2〜3枚になったら、株間を3〜5cmに間引きます。", position: 2, due_days: 10 },
    { title: "追肥", description: "本葉が4〜5枚になったら追肥します。", position: 3, due_days: 20 },
    { title: "収穫", description: "草丈が20〜25cmになったら株ごと収穫します。", position: 4, due_days: 30 }
  ],
  "水菜" => [
    { title: "種まき", description: "プランターに直まきします。種を薄くばらまきます。", position: 1, due_days: 0 },
    { title: "間引き", description: "本葉が2〜3枚になったら、株間を5cmに間引きます。", position: 2, due_days: 10 },
    { title: "追肥", description: "本葉が5〜6枚になったら追肥します。", position: 3, due_days: 20 },
    { title: "収穫", description: "草丈が25〜30cmになったら株ごと収穫します。", position: 4, due_days: 35 }
  ],
  "ラディッシュ（二十日大根）" => [
    { title: "種まき", description: "プランターに直まきします。1cm間隔で種をまきます。", position: 1, due_days: 0 },
    { title: "間引き", description: "本葉が2枚になったら、株間を3〜5cmに間引きます。", position: 2, due_days: 7 },
    { title: "追肥", description: "間引き後に液肥を与えます。", position: 3, due_days: 12 },
    { title: "収穫", description: "根元が2〜3cmに膨らんだら収穫します。", position: 4, due_days: 20 }
  ],
  "ベビーリーフ" => [
    { title: "種まき", description: "プランターに種をばらまきします。薄く土をかけます。", position: 1, due_days: 0 },
    { title: "間引き", description: "込み合っている部分を間引きます。", position: 2, due_days: 7 },
    { title: "追肥", description: "葉が5〜6枚になったら液肥を与えます。", position: 3, due_days: 14 },
    { title: "収穫", description: "草丈が10〜15cmになったら外側の葉から収穫します。", position: 4, due_days: 20 }
  ],
  "バジル" => [
    { title: "種まき・苗の準備", description: "ポットに種をまくか、苗を購入します。", position: 1, due_days: 0 },
    { title: "植え付け", description: "本葉が4〜6枚になったらプランターに植え付けます。", position: 2, due_days: 14 },
    { title: "摘芯", description: "草丈が15〜20cmになったら先端を摘み、わき芽を増やします。", position: 3, due_days: 30 },
    { title: "追肥", description: "2週間に1回程度追肥します。", position: 4, due_days: 35 },
    { title: "収穫", description: "葉が大きくなったら随時収穫します。花が咲く前に摘み取ります。", position: 5, due_days: 45 }
  ],
  "パセリ" => [
    { title: "種まき・苗の準備", description: "ポットに種をまくか、苗を購入します。発芽まで2〜3週間かかります。", position: 1, due_days: 0 },
    { title: "植え付け", description: "本葉が4〜5枚になったらプランターに植え付けます。", position: 2, due_days: 30 },
    { title: "追肥", description: "月に1回程度追肥します。", position: 3, due_days: 60 },
    { title: "収穫", description: "外側の葉から順に収穫します。長期間収穫を楽しめます。", position: 4, due_days: 75 }
  ],
  "青じそ" => [
    { title: "種まき・苗の準備", description: "ポットに種をまくか、苗を購入します。", position: 1, due_days: 0 },
    { title: "植え付け", description: "本葉が4〜6枚になったらプランターに植え付けます。", position: 2, due_days: 14 },
    { title: "摘芯", description: "草丈が30cmになったら先端を摘み、わき芽を増やします。", position: 3, due_days: 35 },
    { title: "追肥", description: "2週間に1回程度追肥します。", position: 4, due_days: 40 },
    { title: "収穫", description: "下の葉から順に収穫します。花が咲く前に摘み取ります。", position: 5, due_days: 50 }
  ],
  "なす" => [
    { title: "苗の準備", description: "苗を購入します。本葉が8〜10枚の苗を選びましょう。", position: 1, due_days: 0 },
    { title: "植え付け", description: "大きめのプランター（30cm以上）に植え付け、支柱を立てます。", position: 2, due_days: 7 },
    { title: "整枝", description: "一番花のすぐ下のわき芽2本を残し、3本仕立てにします。", position: 3, due_days: 21 },
    { title: "追肥", description: "実がつき始めたら1週間に1回程度追肥します。", position: 4, due_days: 35 },
    { title: "収穫", description: "実がツヤのある紫色になったら収穫します。早めに収穫すると次々と実がつきます。", position: 5, due_days: 60 }
  ],
  "ミニキャロット" => [
    { title: "種まき", description: "深めのプランター（20cm以上）に直まきします。", position: 1, due_days: 0 },
    { title: "間引き（1回目）", description: "本葉が2枚になったら、株間を2〜3cmに間引きます。", position: 2, due_days: 14 },
    { title: "間引き（2回目）", description: "本葉が4〜5枚になったら、株間を5〜7cmに間引きます。", position: 3, due_days: 28 },
    { title: "追肥", description: "2回目の間引き後に追肥します。", position: 4, due_days: 35 },
    { title: "収穫", description: "根元が2〜3cmに膨らんだら収穫します。", position: 5, due_days: 60 }
  ],
  "イチゴ" => [
    { title: "苗の準備", description: "苗を購入します。秋植えが一般的です。", position: 1, due_days: 0 },
    { title: "植え付け", description: "プランターに植え付けます。クラウン（株の中心）が土に埋まらないように注意します。", position: 2, due_days: 7 },
    { title: "冬越し", description: "寒さに当てることで花芽が形成されます。", position: 3, due_days: 90 },
    { title: "追肥", description: "春になったら追肥を開始します。月に1回程度追肥します。", position: 4, due_days: 150 },
    { title: "収穫", description: "実が赤く色づいたら収穫します。朝に収穫すると甘みが強いです。", position: 5, due_days: 210 }
  ],
  "枝豆" => [
    { title: "種まき", description: "プランターに直まきします。株間を20cmとります。", position: 1, due_days: 0 },
    { title: "間引き", description: "本葉が2枚になったら、1か所2本に間引きます。", position: 2, due_days: 10 },
    { title: "追肥", description: "花が咲き始めたら追肥します。", position: 3, due_days: 35 },
    { title: "収穫", description: "さやが膨らんで豆が触れる程度になったら収穫します。", position: 4, due_days: 75 }
  ],
  "ほうれん草" => [
    { title: "種まき", description: "プランターに直まきします。種を薄くばらまきます。", position: 1, due_days: 0 },
    { title: "間引き", description: "本葉が2〜3枚になったら、株間を3〜5cmに間引きます。", position: 2, due_days: 10 },
    { title: "追肥", description: "本葉が4〜5枚になったら追肥します。", position: 3, due_days: 20 },
    { title: "収穫", description: "草丈が20〜25cmになったら株ごと収穫します。", position: 4, due_days: 35 }
  ],
  "春菊" => [
    { title: "種まき", description: "プランターに直まきします。種を薄くばらまきます。", position: 1, due_days: 0 },
    { title: "間引き", description: "本葉が2〜3枚になったら、株間を5cmに間引きます。", position: 2, due_days: 10 },
    { title: "追肥", description: "本葉が5〜6枚になったら追肥します。", position: 3, due_days: 20 },
    { title: "収穫", description: "草丈が20cmになったら外側の葉から収穫するか、株ごと収穫します。", position: 4, due_days: 35 }
  ],
  "チンゲン菜" => [
    { title: "種まき", description: "プランターに直まきします。種を薄くばらまきます。", position: 1, due_days: 0 },
    { title: "間引き", description: "本葉が2〜3枚になったら、株間を10cmに間引きます。", position: 2, due_days: 10 },
    { title: "追肥", description: "本葉が4〜5枚になったら追肥します。", position: 3, due_days: 20 },
    { title: "収穫", description: "草丈が15〜20cmになったら株ごと収穫します。", position: 4, due_days: 35 }
  ],
  "サニーレタス" => [
    { title: "種まき", description: "プランターに直まきするか、ポットで育苗します。", position: 1, due_days: 0 },
    { title: "間引き", description: "本葉が2〜3枚になったら、株間を15cmに間引きます。", position: 2, due_days: 14 },
    { title: "追肥", description: "本葉が5〜6枚になったら追肥します。", position: 3, due_days: 25 },
    { title: "収穫", description: "外側の葉から順に収穫します。長期間収穫を楽しめます。", position: 4, due_days: 40 }
  ],
  "ミント" => [
    { title: "苗の準備", description: "苗を購入するか、挿し木で増やします。", position: 1, due_days: 0 },
    { title: "植え付け", description: "プランターに植え付けます。繁殖力が強いため、単独で植えましょう。", position: 2, due_days: 7 },
    { title: "追肥", description: "月に1回程度追肥します。", position: 3, due_days: 30 },
    { title: "収穫", description: "葉が茂ってきたら随時収穫します。摘芯を兼ねて収穫すると脇芽が増えます。", position: 4, due_days: 45 }
  ],
  "ルッコラ" => [
    { title: "種まき", description: "プランターに直まきします。種を薄くばらまきます。", position: 1, due_days: 0 },
    { title: "間引き", description: "本葉が2〜3枚になったら、株間を5cmに間引きます。", position: 2, due_days: 7 },
    { title: "追肥", description: "本葉が4〜5枚になったら液肥を与えます。", position: 3, due_days: 15 },
    { title: "収穫", description: "草丈が10〜15cmになったら外側の葉から収穫します。", position: 4, due_days: 25 }
  ],
  "コリアンダー" => [
    { title: "種まき", description: "プランターに直まきします。種は殻を割ってからまくと発芽しやすくなります。", position: 1, due_days: 0 },
    { title: "間引き", description: "本葉が2〜3枚になったら、株間を5〜10cmに間引きます。", position: 2, due_days: 10 },
    { title: "追肥", description: "本葉が5〜6枚になったら追肥します。", position: 3, due_days: 20 },
    { title: "収穫", description: "草丈が20〜30cmになったら外側の葉から収穫します。", position: 4, due_days: 35 }
  ],
  "ローズマリー" => [
    { title: "苗の準備", description: "苗を購入します。挿し木でも増やせます。", position: 1, due_days: 0 },
    { title: "植え付け", description: "水はけの良い土でプランターに植え付けます。", position: 2, due_days: 7 },
    { title: "追肥", description: "2〜3か月に1回程度追肥します。", position: 3, due_days: 60 },
    { title: "収穫", description: "枝が伸びてきたら随時収穫します。多年草なので長期間楽しめます。", position: 4, due_days: 90 }
  ]
}

# ガイドとステップの作成
guides_data.each do |plant_name, steps|
  plant = plants[plant_name]
  next unless plant

  guide = Guide.find_or_create_by!(plant: plant)

  steps.each do |step_data|
    GuideStep.find_or_create_by!(guide: guide, position: step_data[:position]) do |step|
      step.title = step_data[:title]
      step.description = step_data[:description]
      step.due_days = step_data[:due_days]
    end
  end
end

puts "育て方ガイドデータを作成しました。"
