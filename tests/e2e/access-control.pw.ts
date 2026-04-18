/**
 * E2E テスト: アクセス制御
 * S-006: 体験者のアクセス制限
 * S-007: 停止者のアクセス制限
 */
import { test as base, expect } from "@playwright/test";
import * as path from "path";
import * as fs from "fs";
import { SignJWT } from "jose";

const authDir = path.join(process.cwd(), "playwright", ".auth");

async function buildTrialSession(baseURL: string) {
  const secret = process.env.NEXTAUTH_SECRET!;
  const encoder = new TextEncoder();
  const jwt = await new SignJWT({
    sub: "trial-user",
    discordId: "trial-user",
    name: "体験ユーザー",
    status: "TRIAL",
    role: "MEMBER",
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600,
  })
    .setProtectedHeader({ alg: "HS256" })
    .sign(encoder.encode(secret));

  return {
    cookies: [
      {
        name: "authjs.session-token",
        value: jwt,
        domain: new URL(baseURL).hostname,
        path: "/",
        httpOnly: true,
        secure: false,
        sameSite: "Lax" as const,
        expires: Math.floor(Date.now() / 1000) + 3600,
      },
    ],
    origins: [],
  };
}

async function buildInactiveSession(baseURL: string) {
  const secret = process.env.NEXTAUTH_SECRET!;
  const encoder = new TextEncoder();
  const jwt = await new SignJWT({
    sub: "inactive-user",
    discordId: "inactive-user",
    name: "停止ユーザー",
    status: "INACTIVE",
    role: "MEMBER",
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600,
  })
    .setProtectedHeader({ alg: "HS256" })
    .sign(encoder.encode(secret));

  return {
    cookies: [
      {
        name: "authjs.session-token",
        value: jwt,
        domain: new URL(baseURL).hostname,
        path: "/",
        httpOnly: true,
        secure: false,
        sameSite: "Lax" as const,
        expires: Math.floor(Date.now() / 1000) + 3600,
      },
    ],
    origins: [],
  };
}

// Fixture for trial user
const testWithTrial = base.extend({
  page: async ({ browser }, use) => {
    const baseURL = process.env.BASE_URL || "http://localhost:3000";
    const state = await buildTrialSession(baseURL);
    const ctx = await browser.newContext({ storageState: state });
    const page = await ctx.newPage();
    await use(page);
    await ctx.close();
  },
});

// Fixture for inactive user
const testWithInactive = base.extend({
  page: async ({ browser }, use) => {
    const baseURL = process.env.BASE_URL || "http://localhost:3000";
    const state = await buildInactiveSession(baseURL);
    const ctx = await browser.newContext({ storageState: state });
    const page = await ctx.newPage();
    await use(page);
    await ctx.close();
  },
});

testWithTrial.describe("S-006: 体験者のアクセス制限", () => {
  testWithTrial("/ → /trial にリダイレクトされる", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/trial/);
  });

  testWithTrial("/archive → /trial にリダイレクトされる", async ({ page }) => {
    await page.goto("/archive");
    await expect(page).toHaveURL(/\/trial/);
  });

  testWithTrial("/trial ページが表示される", async ({ page }) => {
    await page.goto("/trial");
    await expect(page).toHaveURL(/\/trial/);
    // Trial page should render without error
    expect(await page.title()).toBeTruthy();
  });

  testWithTrial("/forms にはアクセスできる", async ({ page }) => {
    await page.goto("/forms");
    await expect(page).not.toHaveURL(/\/trial/);
  });
});

testWithInactive.describe("S-007: 停止者のアクセス制限", () => {
  testWithInactive("/ → /inactive にリダイレクトされる", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/inactive/);
  });

  testWithInactive("/journal → /inactive にリダイレクトされる", async ({ page }) => {
    await page.goto("/journal");
    await expect(page).toHaveURL(/\/inactive/);
  });

  testWithInactive("/inactive ページが表示される", async ({ page }) => {
    await page.goto("/inactive");
    await expect(page).toHaveURL(/\/inactive/);
    expect(await page.title()).toBeTruthy();
  });
});
