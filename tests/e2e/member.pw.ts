/**
 * E2E テスト: 会員向けコアページ
 * S-002: 会員ダッシュボード表示
 * S-003: アーカイブ検索・閲覧
 * S-004: ジャーナル記録
 * S-005: イベントカレンダー表示
 * S-008: 申請フォーム送信
 */
import { test, expect } from "./fixtures";

test.describe("S-002: 会員トップページ", () => {
  test("トップページが表示される", async ({ userPage }) => {
    await userPage.goto("/");
    await expect(userPage.getByText("こんにちは")).toBeVisible();
  });

  test("ナビゲーションリンクが5つ表示される（モバイル）", async ({ userPage }) => {
    await userPage.setViewportSize({ width: 375, height: 812 });
    await userPage.goto("/");
    const nav = userPage.locator("nav").filter({ hasText: "ホーム" });
    await expect(nav).toBeVisible();
    await expect(nav.getByText("アーカイブ")).toBeVisible();
    await expect(nav.getByText("イベント")).toBeVisible();
    await expect(nav.getByText("ジャーナル")).toBeVisible();
    await expect(nav.getByText("わたし")).toBeVisible();
  });
});

test.describe("S-003: アーカイブ", () => {
  test("アーカイブ一覧ページが表示される", async ({ userPage }) => {
    await userPage.goto("/archive");
    await expect(userPage).toHaveURL(/\/archive/);
    await expect(userPage.getByRole("heading", { name: "アーカイブ" })).toBeVisible();
  });

  test("検索フィールドが存在する", async ({ userPage }) => {
    await userPage.goto("/archive");
    await expect(userPage.getByPlaceholder(/検索/)).toBeVisible();
  });
});

test.describe("S-004: ジャーナリング", () => {
  test("ジャーナル一覧ページが表示される", async ({ userPage }) => {
    await userPage.goto("/journal");
    await expect(userPage.getByRole("heading", { name: "ジャーナリング" })).toBeVisible();
    await expect(userPage.getByText("今日のテーマ")).toBeVisible();
  });

  test("新規ジャーナルを書くボタンが存在する", async ({ userPage }) => {
    await userPage.goto("/journal");
    // Either "今日のジャーナルを書く" or "今日の記録を編集する"
    const writeButton = userPage.getByRole("link").filter({ hasText: /ジャーナル|編集/ }).first();
    await expect(writeButton).toBeVisible();
  });

  test("ジャーナル編集ページが表示される", async ({ userPage }) => {
    await userPage.goto("/journal/new");
    await expect(userPage.getByRole("heading", { name: /ジャーナル/ })).toBeVisible();
    await expect(userPage.getByPlaceholder(/書いてみましょう/)).toBeVisible();
  });

  test("気分ボタンが5つ表示される", async ({ userPage }) => {
    await userPage.goto("/journal/new");
    const moodSection = userPage.getByText("今日の気分").locator("..");
    const buttons = moodSection.getByRole("button");
    await expect(buttons).toHaveCount(5);
  });
});

test.describe("S-005: イベント", () => {
  test("イベントページが表示される", async ({ userPage }) => {
    await userPage.goto("/events");
    await expect(userPage.getByRole("heading", { name: "イベント" })).toBeVisible();
  });
});

test.describe("S-008: 申請フォーム（わたし）", () => {
  test("わたしページが表示される", async ({ userPage }) => {
    await userPage.goto("/forms");
    // Should show profile area
    await expect(userPage.getByText("申請フォーム")).toBeVisible();
  });

  test("マヤ暦講座フォームが表示される", async ({ userPage }) => {
    await userPage.goto("/forms/maya-calendar");
    await expect(userPage.getByRole("heading", { name: "マヤ暦講座 申請" })).toBeVisible();
    await expect(userPage.getByText("受講を希望する理由")).toBeVisible();
  });

  test("存在しないフォームスラグは 404 になる", async ({ userPage }) => {
    const res = await userPage.goto("/forms/non-existent-form-slug");
    expect(res?.status()).toBe(404);
  });
});
