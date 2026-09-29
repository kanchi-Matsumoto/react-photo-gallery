# react-photo-gallery

フロントエンド道場 第14週「Reactの仕組みを見直す②」で使うプロジェクトです。

## 動かす

```bash
npm install
npm run dev
```

表示されたURL（`http://localhost:5173`）をブラウザで開いてください。

APIから取得した写真が12枚並びます。検索、お気に入り、メモ、ページ送りが動きます。

授業の14-5では、実装済みの取得処理とページ送りの動きを読み解きます。
一覧のページ送りや再読み込みで、お気に入りとメモは失われます。
メモフォームは最初から写真ごとにリセットされます。14-4では、その動きと`key`の関係を読みます。

一覧のページ番号はURLの`?page=2`に持たせ、詳細や前後の写真へのリンクでも引き継ぎます。
そのため、再読み込み、別タブでの表示、ブラウザの「戻る」「進む」でも同じページの写真を取得できます。
ページ番号がない場合や、不正な値の場合は1ページ目を表示します。
通信エラーの場合も、接続を確認して再読み込みしてください。

## 入っているもの

| ファイル | 中身 |
| --- | --- |
| `src/types.ts` | 写真と読み込み状態の型 |
| `src/photosApi.ts` | 取得URLの組み立てと、APIの形から画面の形への詰め替え |
| `src/App.tsx` | ルート定義、state、写真の取得処理 |
| `src/GalleryPage.tsx` | 一覧ページ |
| `src/PhotoDetailPage.tsx` | 詳細ページ |
| `src/MemoForm.tsx` | メモの入力欄 |
| `src/PhotoCard.tsx` | 一覧の1枚ぶん |

CSSは`src/index.css`と`src/App.css`にあります。今日は触りません。

## 写真について

[Lorem Picsum](https://picsum.photos/) から取得します。練習用の写真を配っているサービスです。

## 困ったとき

```bash
npm run lint
node scripts/check-render.mjs
```

`check-render.mjs`は、一覧と詳細の読み込み中、エラー、成功時の表示を確認します。
エフェクトやクリック操作の検証は含みません。

### 教材の動作を検証する場合

既存のPlaywrightとGoogle Chromeが使える環境では、開発サーバーを起動してから次も実行できます。
授業での実行は不要です。

```bash
# 別のターミナルで起動
npm run dev -- --host 127.0.0.1 --port 5174 --strictPort

# Playwrightを別の場所に導入済みの場合は、PLAYWRIGHT_MODULEにそのindex.mjsの絶対パスを指定
node scripts/check-browser.mjs
```

検索、お気に入りの共有、メモ保存とリセット、ページ送りと履歴、詳細の再読み込みと別タブ表示、不正なページ番号、古い応答の無視、通信失敗と不正データの表示を検証します。
APIはテスト用の応答に差し替えるため、外部サービスの稼働状態には依存しません。

自分で書き換えたものを捨てて最初の状態に戻したいときは、次のコマンドです。

```bash
git checkout -- .
```
