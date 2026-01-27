# しばログ

柴犬の生活の質向上を目的とした健康管理PWAアプリ。

## 機能

- **今日のしば** — 写真撮影 + 3タップ診断（耳・しっぽ・目）でご機嫌/体調指数を記録
- **おさんぽトラッカー** — GPS連携で距離・時間を自動計測
- **カレンダー** — 記録一覧・連続記録ストリーク表示
- **推移グラフ** — ご機嫌/体調/散歩データを可視化

## クイックスタート

```bash
git clone https://github.com/nozomu77/ClaudeTest.git
cd ClaudeTest
npm install
npm run dev
```

## 技術構成

- React + TypeScript + Vite
- Tailwind CSS
- recharts（グラフ）
- vite-plugin-pwa（PWA対応）
- localStorage（データ保存）

## ビルド

```bash
npm run build
```

`dist/` を任意のホスティングにデプロイすればOK。

## ライセンス

MIT
