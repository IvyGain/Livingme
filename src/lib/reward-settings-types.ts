export const REWARD_SETTINGS_KEY = "reward_settings";

export interface RewardConfig {
  joinReward: number;    // 入会時報酬（円）
  monthlyReward: number; // 継続報酬（月次・円）
}

export interface RewardSettings {
  FREE: RewardConfig;
  REFERRAL: RewardConfig;
  PARTNER: RewardConfig;
}

export const DEFAULT_REWARD_SETTINGS: RewardSettings = {
  FREE:     { joinReward: 0,    monthlyReward: 0 },
  REFERRAL: { joinReward: 3000, monthlyReward: 1000 },
  PARTNER:  { joinReward: 5000, monthlyReward: 2000 },
};
