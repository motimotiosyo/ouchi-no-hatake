FROM ruby:3.1.0

# 必要なパッケージをインストール
RUN apt-get update -qq && apt-get install -y nodejs postgresql-client

# 作業ディレクトリを設定
WORKDIR /app

# GemfileとGemfile.lockをコピー
COPY Gemfile /app/Gemfile
COPY Gemfile.lock /app/Gemfile.lock

# Gemをインストール
RUN bundle install

# アプリケーションコードをコピー
COPY . /app

# ポートを公開
EXPOSE 3000

# 起動コマンド
CMD ["rails", "server", "-b", "0.0.0.0"]