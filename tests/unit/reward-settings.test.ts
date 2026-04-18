import { describe, test, expect } from "vitest";
import {
  canAcceptReferral,
  DEFAULT_REWARD_SETTINGS,
  type RewardConfig,
} from "@/lib/reward-settings-types";

describe("canAcceptReferral", () => {
  test("maxReferrals === null は常に受け付け可（デフォルト）", () => {
    expect(canAcceptReferral(DEFAULT_REWARD_SETTINGS.REFERRAL, 0)).toBe(true);
    expect(canAcceptReferral(DEFAULT_REWARD_SETTINGS.REFERRAL, 9999)).toBe(true);
  });

  test("maxReferrals = 0 は紹介不可", () => {
    const c: RewardConfig = { joinReward: 0, monthlyReward: 0, maxReferrals: 0 };
    expect(canAcceptReferral(c, 0)).toBe(false);
  });

  test("maxReferrals = 5, 現在 4 名 → 受け付け可", () => {
    const c: RewardConfig = { joinReward: 0, monthlyReward: 0, maxReferrals: 5 };
    expect(canAcceptReferral(c, 4)).toBe(true);
  });

  test("maxReferrals = 5, 現在 5 名 → 上限到達（不可）", () => {
    const c: RewardConfig = { joinReward: 0, monthlyReward: 0, maxReferrals: 5 };
    expect(canAcceptReferral(c, 5)).toBe(false);
  });

  test("maxReferrals = 5, 現在 6 名（運用ミス等）→ 不可", () => {
    const c: RewardConfig = { joinReward: 0, monthlyReward: 0, maxReferrals: 5 };
    expect(canAcceptReferral(c, 6)).toBe(false);
  });
});

describe("DEFAULT_REWARD_SETTINGS には maxReferrals が含まれる", () => {
  test("全ステータスに maxReferrals: null が付く", () => {
    expect(DEFAULT_REWARD_SETTINGS.FREE.maxReferrals).toBeNull();
    expect(DEFAULT_REWARD_SETTINGS.REFERRAL.maxReferrals).toBeNull();
    expect(DEFAULT_REWARD_SETTINGS.PARTNER.maxReferrals).toBeNull();
  });
});
