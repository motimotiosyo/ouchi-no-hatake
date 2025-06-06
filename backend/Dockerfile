# ───────────────────────────────────────
# 1. ベースイメージ（Ruby 3.3.6）と必要パッケージ
# ───────────────────────────────────────
FROM ruby:3.3.6

# Node.js / build-essential / PostgreSQL クライアントをインストール
RUN apt-get update -qq && \
    apt-get install -y nodejs build-essential postgresql-client

WORKDIR /app

# ───────────────────────────────────────
# 2. Gemfile を先にコピーして bundle install
#    → 依存関係のキャッシュを有効にする
# ───────────────────────────────────────
COPY Gemfile Gemfile.lock ./
RUN bundle install

# ───────────────────────────────────────
# 3. 残りのアプリケーションコードをコピー
# ───────────────────────────────────────
COPY . .

# ───────────────────────────────────────
# 4. ポート宣言
# ───────────────────────────────────────
EXPOSE 3000

# ───────────────────────────────────────
# 5. デフォルトコマンド：DB作成・マイグレーション・サーバー起動
# ───────────────────────────────────────
CMD ["bash", "-lc", "bundle exec rails db:create db:migrate && bundle exec rails server -b 0.0.0.0 -p 3000"]
