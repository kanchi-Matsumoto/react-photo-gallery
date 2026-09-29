import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter, Route, Routes } from "react-router";
import { createServer } from "vite";

const server = await createServer({ server: { middlewareMode: true } });

try {
  const { default: App } = await server.ssrLoadModule("/src/App.tsx");
  const { default: GalleryPage } = await server.ssrLoadModule("/src/GalleryPage.tsx");
  const { default: PhotoDetailPage } = await server.ssrLoadModule("/src/PhotoDetailPage.tsx");
  const photo = {
    id: "1", author: "Test Author", imageUrl: "/photo.jpg",
    largeUrl: "/photo.jpg", isFavorite: true, memo: "",
  };
  const render = (component, props, path = "/") => renderToStaticMarkup(
    createElement(MemoryRouter, { initialEntries: [path] },
      createElement(Routes, null,
        createElement(Route, {
          path: component === PhotoDetailPage ? "/photos/:id" : "/*",
          element: createElement(component, props),
        }),
      ),
    ),
  );

  assert.match(render(App), /読み込み中です/);
  for (const component of [GalleryPage, PhotoDetailPage]) {
    const props = {
      photos: [], page: 1, loadError: "取得テストエラー",
      onPageChange() {}, onToggleFavorite() {}, onSaveMemo() {},
    };
    const path = component === PhotoDetailPage ? "/photos/1" : "/";
    const loading = render(component, { ...props, status: "loading" }, path);
    assert.match(loading, /読み込み中です/);
    assert.doesNotMatch(loading, /この写真はありません/);
    assert.match(render(component, { ...props, status: "error" }, path), /取得テストエラー/);
    const success = render(component, { ...props, photos: [photo], status: "success" }, path);
    assert.match(success, /Test Author/);
    assert.doesNotMatch(success, /読み込み中です|取得テストエラー/);
    if (component === GalleryPage) assert.match(success, /お気に入りのみ（1）/);
  }
  console.log("一覧と詳細の読み込み中・エラー・成功表示を確認しました。");
} finally {
  await server.close();
}
