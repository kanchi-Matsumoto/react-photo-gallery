import assert from "node:assert/strict";

// 既存のPlaywright環境から実行する。アプリの依存には追加しない。
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || "playwright");
const browser = await chromium.launch({ headless: true, channel: "chrome" });
const page = await browser.newPage();
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
  await page.route("https://picsum.photos/**", async (route) => {
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
  assert.equal(await page.locator(".card a").first().getAttribute("href"), "/photos/12");
  await page.locator(".card a").first().click();
  await settle();
  await page.reload();
  await page.getByText("今の一覧に、この写真はありません。").waitFor();
  await page.getByRole("link", { name: "一覧へ戻る" }).click();
  await settle();
  await cardsReady();
  await page.getByText("ページ 1", { exact: true }).waitFor();

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
  console.log("検索、件数、共有state、メモ保存とリセット、ページ送り、再取得条件、古い応答、エラーと復帰を確認しました。");
} finally {
  await browser.close();
}
