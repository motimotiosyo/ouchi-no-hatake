# ベースイメージに Ruby 3.3.6 を使用
FROM ruby:3.3.6

# Node.js、ビルドツール、PostgreSQL クライアントをインストール
RUN apt-get update -qq && \
    apt-get install -y nodejs build-essential postgresql-client

# 作業ディレクトリを /app に設定
WORKDIR /app

# Gemfile と Gemfile.lock を先にコピーして依存関係をインストール
COPY Gemfile Gemfile.lock ./
RUN bundle install

# アプリケーションの残りのファイルをコピー
COPY . .

# コンテナが待ち受けるポートを指定（Rails のデフォルトは 3000）
EXPOSE 3000

# 起動時に
# 1) データベースを作成
# 2) マイグレーションを実行
# 3) サーバーを 0.0.0.0:3000 で起動
CMD ["bash", "-lc", "bundle exec rails db:create db:migrate && bundle exec rails server -b 0.0.0.0 -p 3000"]