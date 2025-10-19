# 育て方ガイドデータ

# 既存の植物を取得
plants = Plant.all.index_by(&:name)

# ガイドデータ（全23品種）
# calendar: { planting: "月番号", transplanting: "月番号", pruning: "月番号", fertilizing: "月番号", harvesting: "月番号" }
# フェーズ構造:
#   Phase 0: 栽培準備（土づくり・資材準備） - applicable_to: 'all'
#   Phase 1: 種まき - applicable_to: 'seed_only', 'direct_sow'
#   Phase 2: 育苗 - applicable_to: 'seed_only'
#   Phase 3: 苗準備/植え付け - applicable_to: 'all', 'seedling_only'
#   Phase 4: 育成管理（摘芯・整枝・間引き等） - applicable_to: 'all'
#   Phase 5: 追肥 - applicable_to: 'all'
#   Phase 6: 収穫 - applicable_to: 'all'
guides_data = {
  "ミニトマト" => {
    calendar: { planting: "3,4", transplanting: "4,5", pruning: "5,6,7", fertilizing: "6,7,8", harvesting: "7,8,9" },
    steps: [
      { title: "栽培準備", description: "深めのプランター（30cm以上）と培養土、支柱を用意します。", phase: 0, applicable_to: "all", due_days: 0 },
      { title: "種まき", description: "ポットに種をまきます。本葉が4〜5枚になったら植え付けの適期です。", phase: 1, applicable_to: "seed_only", due_days: 0 },
      { title: "育苗", description: "本葉が出るまで日当たりの良い場所で管理します。", phase: 2, applicable_to: "seed_only", due_days: 14 },
      { title: "植え付け", description: "プランターに植え付け、支柱を立てます。", phase: 3, applicable_to: "all", due_days: 0 },
      { title: "わき芽かき", description: "主枝と葉の間から出るわき芽を摘み取ります。週に1回程度チェックしましょう。", phase: 4, applicable_to: "all", due_days: 21 },
      { title: "追肥", description: "実がつき始めたら2週間に1回程度追肥します。", phase: 5, applicable_to: "all", due_days: 35 },
      { title: "収穫", description: "実が赤く色づいたら収穫の適期です。ヘタの近くから丁寧に摘み取ります。", phase: 6, applicable_to: "all", due_days: 60 }
    ]
  },
  "きゅうり" => {
    calendar: { planting: "4,5", transplanting: "5,6", pruning: "6,7", fertilizing: "6,7,8", harvesting: "7,8,9" },
    steps: [
      { title: "栽培準備", description: "深めのプランターと培養土、支柱やネットを用意します。", phase: 0, applicable_to: "all", due_days: 0 },
      { title: "種まき", description: "ポットに種をまきます。本葉が3〜4枚になったら植え付けの適期です。", phase: 1, applicable_to: "seed_only", due_days: 0 },
      { title: "育苗", description: "本葉が出るまで日当たりの良い場所で管理します。", phase: 2, applicable_to: "seed_only", due_days: 14 },
      { title: "植え付け", description: "プランターに植え付け、支柱やネットを設置します。", phase: 3, applicable_to: "all", due_days: 0 },
      { title: "摘芯・整枝", description: "親づるの先端を摘み、子づるを2〜3本伸ばします。", phase: 4, applicable_to: "all", due_days: 21 },
      { title: "追肥", description: "実がつき始めたら1週間に1回程度追肥します。", phase: 5, applicable_to: "all", due_days: 30 },
      { title: "収穫", description: "実が18〜20cmになったら収穫します。早めに収穫すると次々と実がつきます。", phase: 6, applicable_to: "all", due_days: 50 }
    ]
  },
  "ピーマン" => {
    calendar: { planting: "4,5", transplanting: "5,6", pruning: "6,7", fertilizing: "6,7,8,9", harvesting: "7,8,9,10" },
    steps: [
      { title: "栽培準備", description: "深めのプランター（25cm以上）と培養土、支柱を用意します。", phase: 0, applicable_to: "all", due_days: 0 },
      { title: "植え付け", description: "苗を植え付け、支柱を立てます。本葉が8〜10枚、蕾がついた苗を選びましょう。", phase: 3, applicable_to: "all", due_days: 0 },
      { title: "整枝", description: "一番花のすぐ下のわき芽2本を残し、3本仕立てにします。", phase: 4, applicable_to: "all", due_days: 21 },
      { title: "追肥", description: "実がつき始めたら2週間に1回程度追肥します。", phase: 5, applicable_to: "all", due_days: 35 },
      { title: "収穫", description: "実が緑色でツヤが出てきたら収穫できます。長期間収穫を楽しめます。", phase: 6, applicable_to: "all", due_days: 60 }
    ]
  },
  "レタス" => {
    calendar: { planting: "3,4,9,10", transplanting: "", pruning: "4,5,10,11", fertilizing: "4,5,10,11", harvesting: "5,6,11,12" },
    steps: [
      { title: "栽培準備", description: "プランターと培養土を用意します。", phase: 0, applicable_to: "all", due_days: 0 },
      { title: "種まき", description: "プランターに直まきします。", phase: 1, applicable_to: "direct_sow", due_days: 0 },
      { title: "間引き", description: "本葉が2〜3枚になったら、株間を10〜15cmに間引きます。", phase: 4, applicable_to: "all", due_days: 14 },
      { title: "追肥", description: "本葉が5〜6枚になったら追肥します。", phase: 5, applicable_to: "all", due_days: 25 },
      { title: "収穫", description: "外側の葉から順に収穫するか、株ごと収穫します。", phase: 6, applicable_to: "all", due_days: 40 }
    ]
  },
  "小松菜" => {
    calendar: { planting: "3,4,5,9,10,11", transplanting: "", pruning: "4,5,6,10,11,12", fertilizing: "4,5,6,10,11,12", harvesting: "5,6,7,11,12,1" },
    steps: [
      { title: "栽培準備", description: "プランターと培養土を用意します。", phase: 0, applicable_to: "all", due_days: 0 },
      { title: "種まき", description: "プランターに直まきします。種を薄くばらまきます。", phase: 1, applicable_to: "direct_sow", due_days: 0 },
      { title: "間引き", description: "本葉が2〜3枚になったら、株間を3〜5cmに間引きます。", phase: 4, applicable_to: "all", due_days: 10 },
      { title: "追肥", description: "本葉が4〜5枚になったら追肥します。", phase: 5, applicable_to: "all", due_days: 20 },
      { title: "収穫", description: "草丈が20〜25cmになったら株ごと収穫します。", phase: 6, applicable_to: "all", due_days: 30 }
    ]
  },
  "水菜" => {
    calendar: { planting: "3,4,5,9,10", transplanting: "", pruning: "4,5,6,10,11", fertilizing: "4,5,6,10,11", harvesting: "5,6,7,11,12" },
    steps: [
      { title: "栽培準備", description: "プランターと培養土を用意します。", phase: 0, applicable_to: "all", due_days: 0 },
      { title: "種まき", description: "プランターに直まきします。種を薄くばらまきます。", phase: 1, applicable_to: "direct_sow", due_days: 0 },
      { title: "間引き", description: "本葉が2〜3枚になったら、株間を5cmに間引きます。", phase: 4, applicable_to: "all", due_days: 10 },
      { title: "追肥", description: "本葉が5〜6枚になったら追肥します。", phase: 5, applicable_to: "all", due_days: 20 },
      { title: "収穫", description: "草丈が25〜30cmになったら株ごと収穫します。", phase: 6, applicable_to: "all", due_days: 35 }
    ]
  },
  "ラディッシュ（二十日大根）" => {
    calendar: { planting: "3,4,5,9,10", transplanting: "", pruning: "3,4,5,9,10", fertilizing: "4,5,6,10,11", harvesting: "4,5,6,10,11" },
    steps: [
      { title: "栽培準備", description: "プランターと培養土を用意します。", phase: 0, applicable_to: "all", due_days: 0 },
      { title: "種まき", description: "プランターに直まきします。1cm間隔で種をまきます。", phase: 1, applicable_to: "direct_sow", due_days: 0 },
      { title: "間引き", description: "本葉が2枚になったら、株間を3〜5cmに間引きます。", phase: 4, applicable_to: "all", due_days: 7 },
      { title: "追肥", description: "間引き後に液肥を与えます。", phase: 5, applicable_to: "all", due_days: 12 },
      { title: "収穫", description: "根元が2〜3cmに膨らんだら収穫します。", phase: 6, applicable_to: "all", due_days: 20 }
    ]
  },
  "ベビーリーフ" => {
    calendar: { planting: "3,4,5,9,10", transplanting: "", pruning: "3,4,5,9,10", fertilizing: "4,5,6,10,11", harvesting: "4,5,6,10,11,12" },
    steps: [
      { title: "栽培準備", description: "プランターと培養土を用意します。", phase: 0, applicable_to: "all", due_days: 0 },
      { title: "種まき", description: "プランターに種をばらまきします。薄く土をかけます。", phase: 1, applicable_to: "direct_sow", due_days: 0 },
      { title: "間引き", description: "込み合っている部分を間引きます。", phase: 4, applicable_to: "all", due_days: 7 },
      { title: "追肥", description: "葉が5〜6枚になったら液肥を与えます。", phase: 5, applicable_to: "all", due_days: 14 },
      { title: "収穫", description: "草丈が10〜15cmになったら外側の葉から収穫します。", phase: 6, applicable_to: "all", due_days: 20 }
    ]
  },
  "バジル" => {
    calendar: { planting: "4,5", transplanting: "5,6", pruning: "6,7,8", fertilizing: "6,7,8,9", harvesting: "7,8,9,10" },
    steps: [
      { title: "栽培準備", description: "プランターと培養土を用意します。", phase: 0, applicable_to: "all", due_days: 0 },
      { title: "種まき", description: "ポットに種をまきます。", phase: 1, applicable_to: "seed_only", due_days: 0 },
      { title: "育苗", description: "本葉が出るまで日当たりの良い場所で管理します。", phase: 2, applicable_to: "seed_only", due_days: 14 },
      { title: "植え付け", description: "本葉が4〜6枚になったらプランターに植え付けます。", phase: 3, applicable_to: "all", due_days: 0 },
      { title: "摘芯", description: "草丈が15〜20cmになったら先端を摘み、わき芽を増やします。", phase: 4, applicable_to: "all", due_days: 30 },
      { title: "追肥", description: "2週間に1回程度追肥します。", phase: 5, applicable_to: "all", due_days: 35 },
      { title: "収穫", description: "葉が大きくなったら随時収穫します。花が咲く前に摘み取ります。", phase: 6, applicable_to: "all", due_days: 45 }
    ]
  },
  "パセリ" => {
    calendar: { planting: "3,4,9,10", transplanting: "4,5,10,11", pruning: "", fertilizing: "5,6,7,8,9,10,11,12", harvesting: "6,7,8,9,10,11,12,1,2" },
    steps: [
      { title: "栽培準備", description: "プランターと培養土を用意します。", phase: 0, applicable_to: "all", due_days: 0 },
      { title: "種まき", description: "ポットに種をまきます。発芽まで2〜3週間かかります。", phase: 1, applicable_to: "seed_only", due_days: 0 },
      { title: "育苗", description: "本葉が出るまで日当たりの良い場所で管理します。", phase: 2, applicable_to: "seed_only", due_days: 21 },
      { title: "植え付け", description: "本葉が4〜5枚になったらプランターに植え付けます。", phase: 3, applicable_to: "all", due_days: 0 },
      { title: "追肥", description: "月に1回程度追肥します。", phase: 5, applicable_to: "all", due_days: 60 },
      { title: "収穫", description: "外側の葉から順に収穫します。長期間収穫を楽しめます。", phase: 6, applicable_to: "all", due_days: 75 }
    ]
  },
  "青じそ" => {
    calendar: { planting: "4,5", transplanting: "5,6", pruning: "6,7,8", fertilizing: "6,7,8,9", harvesting: "7,8,9,10" },
    steps: [
      { title: "栽培準備", description: "プランターと培養土を用意します。", phase: 0, applicable_to: "all", due_days: 0 },
      { title: "種まき", description: "ポットに種をまきます。", phase: 1, applicable_to: "seed_only", due_days: 0 },
      { title: "育苗", description: "本葉が出るまで日当たりの良い場所で管理します。", phase: 2, applicable_to: "seed_only", due_days: 14 },
      { title: "植え付け", description: "本葉が4〜6枚になったらプランターに植え付けます。", phase: 3, applicable_to: "all", due_days: 0 },
      { title: "摘芯", description: "草丈が30cmになったら先端を摘み、わき芽を増やします。", phase: 4, applicable_to: "all", due_days: 35 },
      { title: "追肥", description: "2週間に1回程度追肥します。", phase: 5, applicable_to: "all", due_days: 40 },
      { title: "収穫", description: "下の葉から順に収穫します。花が咲く前に摘み取ります。", phase: 6, applicable_to: "all", due_days: 50 }
    ]
  },
  "なす" => {
    calendar: { planting: "4,5", transplanting: "5,6", pruning: "6,7,8", fertilizing: "6,7,8,9", harvesting: "7,8,9,10" },
    steps: [
      { title: "栽培準備", description: "大きめのプランター（30cm以上）と培養土、支柱を用意します。", phase: 0, applicable_to: "all", due_days: 0 },
      { title: "植え付け", description: "苗を植え付け、支柱を立てます。本葉が8〜10枚の苗を選びましょう。", phase: 3, applicable_to: "all", due_days: 0 },
      { title: "整枝", description: "一番花のすぐ下のわき芽2本を残し、3本仕立てにします。", phase: 4, applicable_to: "all", due_days: 21 },
      { title: "追肥", description: "実がつき始めたら1週間に1回程度追肥します。", phase: 5, applicable_to: "all", due_days: 35 },
      { title: "収穫", description: "実がツヤのある紫色になったら収穫します。早めに収穫すると次々と実がつきます。", phase: 6, applicable_to: "all", due_days: 60 }
    ]
  },
  "ミニキャロット" => {
    calendar: { planting: "3,4,9,10", transplanting: "", pruning: "4,5,10,11", fertilizing: "5,6,11,12", harvesting: "6,7,12,1" },
    steps: [
      { title: "栽培準備", description: "深めのプランター（20cm以上）と培養土を用意します。", phase: 0, applicable_to: "all", due_days: 0 },
      { title: "種まき", description: "プランターに直まきします。", phase: 1, applicable_to: "direct_sow", due_days: 0 },
      { title: "間引き（1回目）", description: "本葉が2枚になったら、株間を2〜3cmに間引きます。", phase: 4, applicable_to: "all", due_days: 14 },
      { title: "間引き（2回目）・追肥", description: "本葉が4〜5枚になったら、株間を5〜7cmに間引き、追肥します。", phase: 5, applicable_to: "all", due_days: 28 },
      { title: "収穫", description: "根元が2〜3cmに膨らんだら収穫します。", phase: 6, applicable_to: "all", due_days: 60 }
    ]
  },
  "イチゴ" => {
    calendar: { planting: "10,11", transplanting: "10,11", pruning: "", fertilizing: "3,4,5", harvesting: "5,6" },
    steps: [
      { title: "栽培準備", description: "プランターと培養土を用意します。", phase: 0, applicable_to: "all", due_days: 0 },
      { title: "植え付け", description: "苗を植え付けます。クラウン（株の中心）が土に埋まらないように注意します。秋植えが一般的です。", phase: 3, applicable_to: "all", due_days: 0 },
      { title: "冬越し", description: "寒さに当てることで花芽が形成されます。", phase: 4, applicable_to: "all", due_days: 90 },
      { title: "追肥", description: "春になったら追肥を開始します。月に1回程度追肥します。", phase: 5, applicable_to: "all", due_days: 150 },
      { title: "収穫", description: "実が赤く色づいたら収穫します。朝に収穫すると甘みが強いです。", phase: 6, applicable_to: "all", due_days: 210 }
    ]
  },
  "枝豆" => {
    calendar: { planting: "5,6", transplanting: "", pruning: "6,7", fertilizing: "6,7,8", harvesting: "8,9" },
    steps: [
      { title: "栽培準備", description: "プランターと培養土を用意します。", phase: 0, applicable_to: "all", due_days: 0 },
      { title: "種まき", description: "プランターに直まきします。株間を20cmとります。", phase: 1, applicable_to: "direct_sow", due_days: 0 },
      { title: "間引き", description: "本葉が2枚になったら、1か所2本に間引きます。", phase: 4, applicable_to: "all", due_days: 10 },
      { title: "追肥", description: "花が咲き始めたら追肥します。", phase: 5, applicable_to: "all", due_days: 35 },
      { title: "収穫", description: "さやが膨らんで豆が触れる程度になったら収穫します。", phase: 6, applicable_to: "all", due_days: 75 }
    ]
  },
  "ほうれん草" => {
    calendar: { planting: "3,4,5,9,10,11", transplanting: "", pruning: "4,5,6,10,11,12", fertilizing: "4,5,6,10,11,12", harvesting: "5,6,7,11,12,1" },
    steps: [
      { title: "栽培準備", description: "プランターと培養土を用意します。", phase: 0, applicable_to: "all", due_days: 0 },
      { title: "種まき", description: "プランターに直まきします。種を薄くばらまきます。", phase: 1, applicable_to: "direct_sow", due_days: 0 },
      { title: "間引き", description: "本葉が2〜3枚になったら、株間を3〜5cmに間引きます。", phase: 4, applicable_to: "all", due_days: 10 },
      { title: "追肥", description: "本葉が4〜5枚になったら追肥します。", phase: 5, applicable_to: "all", due_days: 20 },
      { title: "収穫", description: "草丈が20〜25cmになったら株ごと収穫します。", phase: 6, applicable_to: "all", due_days: 35 }
    ]
  },
  "春菊" => {
    calendar: { planting: "3,4,9,10", transplanting: "", pruning: "4,5,10,11", fertilizing: "4,5,10,11", harvesting: "5,6,11,12" },
    steps: [
      { title: "栽培準備", description: "プランターと培養土を用意します。", phase: 0, applicable_to: "all", due_days: 0 },
      { title: "種まき", description: "プランターに直まきします。種を薄くばらまきします。", phase: 1, applicable_to: "direct_sow", due_days: 0 },
      { title: "間引き", description: "本葉が2〜3枚になったら、株間を5cmに間引きます。", phase: 4, applicable_to: "all", due_days: 10 },
      { title: "追肥", description: "本葉が5〜6枚になったら追肥します。", phase: 5, applicable_to: "all", due_days: 20 },
      { title: "収穫", description: "草丈が20cmになったら外側の葉から収穫するか、株ごと収穫します。", phase: 6, applicable_to: "all", due_days: 35 }
    ]
  },
  "チンゲン菜" => {
    calendar: { planting: "3,4,5,9,10", transplanting: "", pruning: "4,5,6,10,11", fertilizing: "4,5,6,10,11", harvesting: "5,6,7,11,12" },
    steps: [
      { title: "栽培準備", description: "プランターと培養土を用意します。", phase: 0, applicable_to: "all", due_days: 0 },
      { title: "種まき", description: "プランターに直まきします。種を薄くばらまきます。", phase: 1, applicable_to: "direct_sow", due_days: 0 },
      { title: "間引き", description: "本葉が2〜3枚になったら、株間を10cmに間引きます。", phase: 4, applicable_to: "all", due_days: 10 },
      { title: "追肥", description: "本葉が4〜5枚になったら追肥します。", phase: 5, applicable_to: "all", due_days: 20 },
      { title: "収穫", description: "草丈が15〜20cmになったら株ごと収穫します。", phase: 6, applicable_to: "all", due_days: 35 }
    ]
  },
  "サニーレタス" => {
    calendar: { planting: "3,4,9,10", transplanting: "", pruning: "4,5,10,11", fertilizing: "4,5,10,11", harvesting: "5,6,11,12" },
    steps: [
      { title: "栽培準備", description: "プランターと培養土を用意します。", phase: 0, applicable_to: "all", due_days: 0 },
      { title: "種まき", description: "プランターに直まきします。", phase: 1, applicable_to: "direct_sow", due_days: 0 },
      { title: "間引き", description: "本葉が2〜3枚になったら、株間を15cmに間引きます。", phase: 4, applicable_to: "all", due_days: 14 },
      { title: "追肥", description: "本葉が5〜6枚になったら追肥します。", phase: 5, applicable_to: "all", due_days: 25 },
      { title: "収穫", description: "外側の葉から順に収穫します。長期間収穫を楽しめます。", phase: 6, applicable_to: "all", due_days: 40 }
    ]
  },
  "ミント" => {
    calendar: { planting: "3,4,5", transplanting: "4,5,6", pruning: "", fertilizing: "4,5,6,7,8,9,10", harvesting: "5,6,7,8,9,10,11" },
    steps: [
      { title: "栽培準備", description: "プランターと培養土を用意します。", phase: 0, applicable_to: "all", due_days: 0 },
      { title: "植え付け", description: "苗を植え付けます。繁殖力が強いため、単独で植えましょう。", phase: 3, applicable_to: "all", due_days: 0 },
      { title: "追肥", description: "月に1回程度追肥します。", phase: 5, applicable_to: "all", due_days: 30 },
      { title: "収穫", description: "葉が茂ってきたら随時収穫します。摘芯を兼ねて収穫すると脇芽が増えます。", phase: 6, applicable_to: "all", due_days: 45 }
    ]
  },
  "ルッコラ" => {
    calendar: { planting: "3,4,5,9,10", transplanting: "", pruning: "3,4,5,9,10", fertilizing: "4,5,6,10,11", harvesting: "4,5,6,10,11,12" },
    steps: [
      { title: "栽培準備", description: "プランターと培養土を用意します。", phase: 0, applicable_to: "all", due_days: 0 },
      { title: "種まき", description: "プランターに直まきします。種を薄くばらまきます。", phase: 1, applicable_to: "direct_sow", due_days: 0 },
      { title: "間引き", description: "本葉が2〜3枚になったら、株間を5cmに間引きます。", phase: 4, applicable_to: "all", due_days: 7 },
      { title: "追肥", description: "本葉が4〜5枚になったら液肥を与えます。", phase: 5, applicable_to: "all", due_days: 15 },
      { title: "収穫", description: "草丈が10〜15cmになったら外側の葉から収穫します。", phase: 6, applicable_to: "all", due_days: 25 }
    ]
  },
  "コリアンダー" => {
    calendar: { planting: "3,4,9,10", transplanting: "", pruning: "4,5,10,11", fertilizing: "4,5,10,11", harvesting: "5,6,11,12" },
    steps: [
      { title: "栽培準備", description: "プランターと培養土を用意します。", phase: 0, applicable_to: "all", due_days: 0 },
      { title: "種まき", description: "プランターに直まきします。種は殻を割ってからまくと発芽しやすくなります。", phase: 1, applicable_to: "direct_sow", due_days: 0 },
      { title: "間引き", description: "本葉が2〜3枚になったら、株間を5〜10cmに間引きます。", phase: 4, applicable_to: "all", due_days: 10 },
      { title: "追肥", description: "本葉が5〜6枚になったら追肥します。", phase: 5, applicable_to: "all", due_days: 20 },
      { title: "収穫", description: "草丈が20〜30cmになったら外側の葉から収穫します。", phase: 6, applicable_to: "all", due_days: 35 }
    ]
  },
  "ローズマリー" => {
    calendar: { planting: "3,4,5,9,10", transplanting: "4,5,10,11", pruning: "", fertilizing: "4,5,6,9,10,11", harvesting: "4,5,6,7,8,9,10,11,12,1,2,3" },
    steps: [
      { title: "栽培準備", description: "水はけの良い土とプランターを用意します。", phase: 0, applicable_to: "all", due_days: 0 },
      { title: "植え付け", description: "苗を植え付けます。挿し木でも増やせます。", phase: 3, applicable_to: "all", due_days: 0 },
      { title: "追肥", description: "2〜3か月に1回程度追肥します。", phase: 5, applicable_to: "all", due_days: 60 },
      { title: "収穫", description: "枝が伸びてきたら随時収穫します。多年草なので長期間楽しめます。", phase: 6, applicable_to: "all", due_days: 90 }
    ]
  }
}

# ガイドとステップの作成
guides_data.each do |plant_name, data|
  plant = plants[plant_name]
  next unless plant

  guide = Guide.find_or_create_by!(plant: plant) do |g|
    g.planting_months = data[:calendar][:planting]
    g.transplanting_months = data[:calendar][:transplanting]
    g.pruning_months = data[:calendar][:pruning]
    g.fertilizing_months = data[:calendar][:fertilizing]
    g.harvesting_months = data[:calendar][:harvesting]
  end

  # 既存のガイドにもカレンダー情報を更新
  guide.update!(
    planting_months: data[:calendar][:planting],
    transplanting_months: data[:calendar][:transplanting],
    pruning_months: data[:calendar][:pruning],
    fertilizing_months: data[:calendar][:fertilizing],
    harvesting_months: data[:calendar][:harvesting]
  )

  data[:steps].each_with_index do |step_data, index|
    GuideStep.find_or_create_by!(guide: guide, phase: step_data[:phase]) do |step|
      step.title = step_data[:title]
      step.description = step_data[:description]
      step.due_days = step_data[:due_days]
      step.applicable_to = step_data[:applicable_to]
      step.position = index + 1
    end
  end
end

puts "育て方ガイドデータを作成しました。"
