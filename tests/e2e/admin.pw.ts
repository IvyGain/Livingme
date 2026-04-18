/**
 * E2E テスト: 管理画面
 * S-009: 管理者 - 今日の表示更新
 * S-010: 管理者 - 会員一覧・同期
 */
import { test, expect } from "./fixtures";

test.describe("S-009 / S-010: 管理画面", () => {
  test("管理ダッシュボードが表示される", async ({ adminPage }) => {
    await adminPage.goto("/admin");
    await expect(adminPage.getByRole("heading", { name: "ダッシュボード" })).toBeVisible();
    await expect(adminPage.getByText("総会員数")).toBeVisible();
  });

  test("会員管理ページが表示される", async ({ adminPage }) => {
    await adminPage.goto("/admin/members");
    await expect(adminPage.getByRole("heading", { name: "会員管理" })).toBeVisible();
  });

  test("今日の表示管理ページが表示される", async ({ adminPage }) => {
    await adminPage.goto("/admin/content/today");
    // Today's content form should be visible
    await expect(adminPage.getByText("今日の表示")).toBeVisible();
  });

  test("アーカイブ管理ページが表示される", async ({ adminPage }) => {
    await adminPage.goto("/admin/content/archives");
    await expect(adminPage.getByText("アーカイブ管理")).toBeVisible();
  });

  test("非管理者がアクセスすると / にリダイレクトされる", async ({ userPage }) => {
    await userPage.goto("/admin");
    // Regular user (MEMBER role) should be redirected
    await expect(userPage).not.toHaveURL(/\/admin/);
  });
});
