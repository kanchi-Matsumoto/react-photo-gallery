# react-photo-gallery

フロントエンド道場 第14週「Reactの仕組みを見直す②」で使うプロジェクトです。

## 動かす

```bash
npm install
npm run dev
```

表示されたURL（`http://localhost:5173`）をブラウザで開いてください。

仮データの写真が3枚並びます。検索、お気に入り、メモは、この3枚の上で動きます。

APIからの取得とページ送りは、授業の14-5で書きます。

## 入っているもの

| ファイル | 中身 |
| --- | --- |
| `src/types.ts` | `ApiPhoto`と`Photo`の型 |
| `src/samplePhotos.ts` | 仮データ3件 |
| `src/photosApi.ts` | 取得URLの組み立てと、APIの形から画面の形への詰め替え。14-5で使います |
| `src/App.tsx` | ルート定義とstate |
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
```

14-6で、ここに出る3件を直します。それまでは出たままで構いません。

自分で書き換えたものを捨てて最初の状態に戻したいときは、次のコマンドです。

```bash
git checkout -- .
```
