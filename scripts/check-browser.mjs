import assert from "node:assert/strict";

// 既存のPlaywright環境から実行する。アプリの依存には追加しない。
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || "playwright");
const browser = await chromium.launch({ headless: true, channel: "chrome" });
const context = await browser.newContext();
const page = await context.newPage();
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
const baseUrl = process.env.GALLERY_URL || "http://127.0.0.1:5174";
const photos = (number) => Array.from({ length: 12 }, (_, index) => ({
  id: String((number - 1) * 12 + index),
  author: index === 0 ? "Alice" : `Author ${index}`,
}));
let mode = "success";
let requests = 0;
let firstRequest;
const settle = () => page.evaluate(() => new Promise((resolve) => {
  requestAnimationFrame(() => requestAnimationFrame(resolve));
}));
const cardsReady = () => page.waitForFunction(() => document.querySelectorAll(".card").length === 12);
const search = page.getByRole("textbox", { name: "作者名でしぼりこむ" });
const memo = page.getByRole("textbox", { name: "この写真のメモ" });

try {
  await page.context().route("https://picsum.photos/**", async (route) => {
    const url = new URL(route.request().url());
    if (url.pathname !== "/v2/list") return route.fulfill({ status: 204 });
    requests++;
    // StrictModeの最初のリクエストを遅らせ、古い結果が上書きしないか確かめる。
    if (requests === 1) { firstRequest = route; return; }
    if (mode === "http-error") return route.fulfill({ status: 503, body: "Unavailable" });
    if (mode === "network-error") return route.abort("failed");
    if (mode === "invalid-list") return route.fulfill({ json: {} });
    if (mode === "invalid-photo") return route.fulfill({ json: [{ id: "0", author: null }] });
    if (mode === "empty") return route.fulfill({ json: [] });
    return route.fulfill({ json: photos(Number(url.searchParams.get("page"))) });
  });

  await page.goto(baseUrl);
  await cardsReady();
  assert.ok(firstRequest, "StrictModeの取得を検証するため開発サーバーを使ってください");
  await firstRequest.fulfill({ json: [{ id: "999", author: "Stale response" }] });
  await settle();
  assert.equal(await page.locator(".card").count(), 12);
  assert.equal(await page.getByText("Stale response").count(), 0);
  const initialRequests = requests;

  await search.fill("ALICE");
  await settle();
  assert.equal(await page.locator(".card").count(), 1);
  await search.fill("該当なし");
  await settle();
  await page.getByText("あてはまる写真がありません。").waitFor();
  await search.fill("");
  await settle();
  await page.locator(".card button").first().click();
  await settle();
  await page.getByRole("button", { name: "お気に入りのみ（1）" }).click();
  await settle();
  assert.equal(await page.locator(".card").count(), 1);
  await page.locator(".card a").first().click();
  await settle();
  assert.equal(await page.getByRole("button", { name: "★ お気に入り" }).getAttribute("aria-pressed"), "true");

  await page.getByRole("button", { name: "保存", exact: true }).click();
  await settle();
  await page.getByRole("alert").waitFor();
  await memo.fill("写真Aの下書き");
  await page.getByRole("link", { name: "次の写真" }).click();
  await settle();
  assert.equal(await memo.inputValue(), "");
  assert.equal(await page.getByRole("alert").count(), 0);
  await page.getByRole("link", { name: "前の写真" }).click();
  await settle();
  assert.equal(await memo.inputValue(), "");
  await memo.fill("  保存したメモ  ");
  await page.getByRole("button", { name: "保存", exact: true }).click();
  await settle();
  assert.equal(await page.locator(".memo-body").innerText(), "保存したメモ");
  assert.equal(await memo.inputValue(), "");
  await page.getByRole("link", { name: "次の写真" }).click();
  await settle();
  assert.equal(await page.locator(".memo-body").count(), 0);
  await page.getByRole("link", { name: "前の写真" }).click();
  await settle();
  assert.equal(await page.locator(".memo-body").innerText(), "保存したメモ");
  await page.getByRole("button", { name: "★ お気に入り" }).click();
  await settle();
  await page.getByRole("link", { name: "一覧へ戻る" }).click();
  await settle();
  await cardsReady();
  assert.equal(await search.inputValue(), "");
  await page.getByRole("button", { name: "お気に入りのみ（0）" }).waitFor();
  assert.equal(requests, initialRequests, "検索・お気に入り・詳細移動では再取得しない");

  await page.locator(".card button").first().click();
  await settle();
  await search.fill("Alice");
  await settle();
  await page.getByRole("button", { name: "お気に入りのみ（1）" }).click();
  await settle();
  await page.getByRole("button", { name: "次のページ" }).click();
  await settle();
  await cardsReady();
  assert.equal(await search.inputValue(), "");
  assert.equal(await page.getByRole("button", { name: "お気に入りのみ（0）" }).getAttribute("aria-pressed"), "false");
  assert.equal(await page.locator(".card a").first().getAttribute("href"), "/photos/12?page=2");
  await page.locator(".card a").first().click();
  await settle();
  const detailUrl = page.url();
  assert.equal(new URL(detailUrl).searchParams.get("page"), "2");
  await page.reload();
  await memo.waitFor();
  assert.match(await page.locator(".detail-image").getAttribute("src"), /\/id\/12\//);
  await page.getByRole("link", { name: "次の写真" }).click();
  await settle();
  assert.equal(new URL(page.url()).searchParams.get("page"), "2");
  await page.reload();
  await memo.waitFor();
  assert.match(await page.locator(".detail-image").getAttribute("src"), /\/id\/13\//);
  await page.getByRole("link", { name: "前の写真" }).click();
  await settle();
  assert.equal(page.url(), detailUrl);

  const newTab = await context.newPage();
  newTab.on("pageerror", (error) => errors.push(error.message));
  try {
    await newTab.goto(detailUrl);
    await newTab.getByRole("textbox", { name: "この写真のメモ" }).waitFor();
    assert.match(await newTab.locator(".detail-image").getAttribute("src"), /\/id\/12\//);
  } finally {
    await newTab.close();
  }
  await page.getByRole("link", { name: "Photo Gallery", exact: true }).click();
  await settle();
  await cardsReady();
  await page.getByText("ページ 2", { exact: true }).waitFor();
  await page.locator(".card a").first().click();
  await settle();
  await page.getByRole("link", { name: "一覧へ戻る" }).click();
  await settle();
  await cardsReady();
  await page.getByText("ページ 2", { exact: true }).waitFor();
  await page.getByRole("button", { name: "次のページ" }).click();
  await settle();
  await cardsReady();
  assert.equal(await page.locator(".card a").first().getAttribute("href"), "/photos/24?page=3");
  await page.goBack();
  await settle();
  await cardsReady();
  await page.getByText("ページ 2", { exact: true }).waitFor();
  assert.equal(await page.locator(".card a").first().getAttribute("href"), "/photos/12?page=2");
  await page.goForward();
  await settle();
  await cardsReady();
  await page.getByText("ページ 3", { exact: true }).waitFor();
  await page.reload();
  await cardsReady();
  assert.equal(await page.locator(".card a").first().getAttribute("href"), "/photos/24?page=3");

  for (const invalidPage of ["0", "-1", "1.5", "abc", "Infinity", "9007199254740992"]) {
    await page.goto(`${baseUrl}/?page=${invalidPage}`);
    await cardsReady();
    await page.getByText("ページ 1", { exact: true }).waitFor();
    assert.equal(await page.getByRole("button", { name: "前のページ" }).isDisabled(), true);
  }

  for (const failure of ["http-error", "network-error", "invalid-list", "invalid-photo"]) {
    mode = failure;
    await page.reload();
    await page.locator(".message.error").waitFor();
    assert.equal(await page.locator(".card").count(), 0);
    if (failure.startsWith("invalid")) assert.match(await page.locator(".message.error").innerText(), /形式が正しくありません/);
  }
  mode = "empty";
  await page.reload();
  await page.getByText("あてはまる写真がありません。").waitFor();
  assert.equal(await page.locator(".message.error").count(), 0);
  mode = "success";
  await page.goto(`${baseUrl}/photos/0`);
  await memo.waitFor();
  assert.equal(await memo.inputValue(), "");
  await page.getByRole("link", { name: "一覧へ戻る" }).click();
  await settle();
  await cardsReady();
  assert.deepEqual(errors, []);
  console.log("検索、件数、共有state、メモ保存とリセット、ページ送りと履歴、再読み込みと別タブ表示、再取得条件、古い応答、エラーと復帰を確認しました。");
} finally {
  await browser.close();
}
