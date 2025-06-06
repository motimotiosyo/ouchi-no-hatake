# Node.js v23をベースイメージとして使用
FROM node:23

# コンテナ内での作業ディレクトリを /app に設定
WORKDIR /app

# 依存関係定義ファイルをコピー
COPY package.json package-lock.json ./
# 依存パッケージをインストール
RUN npm install

# 残りのアプリケーションコードをすべてコピー
COPY . .

# コンテナが外部に公開するポートを指定
EXPOSE 3000

# コンテナ起動時に実行するコマンドを設定
CMD ["npm", "run", "dev"]