export const REWARD_SETTINGS_KEY = "reward_settings";

export interface RewardConfig {
  joinReward: number;    // 入会時報酬（円）
  monthlyReward: number; // 継続報酬（月次・円）
  /**
   * この会員ステータスで受け入れ可能な紹介者数の上限。
   * null = 無制限（従来挙動）。
   * 0 = このステータスでは紹介を受け付けない。
   */
  maxReferrals: number | null;
}

export interface RewardSettings {
  FREE: RewardConfig;
  REFERRAL: RewardConfig;
  PARTNER: RewardConfig;
}

export const DEFAULT_REWARD_SETTINGS: RewardSettings = {
  FREE:     { joinReward: 0,    monthlyReward: 0,    maxReferrals: null },
  REFERRAL: { joinReward: 3000, monthlyReward: 1000, maxReferrals: null },
  PARTNER:  { joinReward: 5000, monthlyReward: 2000, maxReferrals: null },
};

/**
 * 紹介受付可否を判定。
 * - maxReferrals が null → 常に受け付け可
 * - maxReferrals が数値 → 現在の紹介数が上限未満なら受け付け可
 */
export function canAcceptReferral(
  config: RewardConfig,
  currentReferralCount: number,
): boolean {
  if (config.maxReferrals === null) return true;
  return currentReferralCount < config.maxReferrals;
}
