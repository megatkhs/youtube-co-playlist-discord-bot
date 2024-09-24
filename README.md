<h1 align="center">YouTube 共有プレイリスト作成 Discordボット</h1>
<p align="center">Discordコミュニティで共有のYouTubeプレイリストを簡単に作るためのボット</p>

## 開発の手順
VSCodeの[開発コンテナ](https://code.visualstudio.com/docs/devcontainers/containers)を使用して開発することを想定しています。
開発コンテナを利用できるように環境をセットアップすることで開発を開始できます。

### 環境変数の準備
開発環境の準備については、Discussionの #5 を確認してください。

### 依存パッケージのインストール
開発コンテナ内で、下記コマンドを実行してください。
```
pnpm install
```


## コマンド
| コマンド | 用途 |
| --- | --- |
| `pnpm dev` | 開発サーバーを起動する(ボット/Webダッシュボード  http://127.0.0.1:5173/ ) |