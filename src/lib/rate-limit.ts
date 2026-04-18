/**
 * シンプルなインメモリ レートリミッター
 * 本番環境では Redis への置き換えを推奨
 */

interface RateLimitRecord {
  failCount: number;
  firstFailAt: number;
  blockedUntil?: number;
}

const store = new Map<string, RateLimitRecord>();

const MAX_FAILS = 5;
const WINDOW_MS = 15 * 60_000;  // 15分
const BLOCK_MS  = 15 * 60_000;  // 15分ブロック

// 古いエントリを定期削除
setInterval(() => {
  const now = Date.now();
  for (const [key, rec] of store.entries()) {
    const expired = rec.blockedUntil
      ? rec.blockedUntil < now
      : now - rec.firstFailAt > WINDOW_MS;
    if (expired) store.delete(key);
  }
}, 5 * 60_000);

export interface RateLimitResult {
  allowed: boolean;
  /** ブロック解除までの残秒数（blockedの場合のみ） */
  retryAfterSeconds?: number;
}

/** 現在のレート状態を確認（副作用なし） */
export function checkRateLimit(key: string): RateLimitResult {
  const now = Date.now();
  const rec = store.get(key);
  if (!rec) return { allowed: true };

  if (rec.blockedUntil && rec.blockedUntil > now) {
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil((rec.blockedUntil - now) / 1000),
    };
  }
  // ウィンドウ外なら通す
  if (now - rec.firstFailAt >= WINDOW_MS) return { allowed: true };

  return { allowed: true };
}

/** ログイン失敗を記録する */
export function recordFailure(key: string): RateLimitResult {
  const now = Date.now();
  let rec = store.get(key);

  if (!rec || now - rec.firstFailAt >= WINDOW_MS) {
    rec = { failCount: 0, firstFailAt: now };
  }

  rec.failCount++;

  if (rec.failCount >= MAX_FAILS) {
    rec.blockedUntil = now + BLOCK_MS;
    store.set(key, rec);
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil(BLOCK_MS / 1000),
    };
  }

  store.set(key, rec);
  return { allowed: true };
}

/** ログイン成功時にカウンターをリセット */
export function clearFailures(key: string): void {
  store.delete(key);
}

/**
 * カスタム閾値でのレートリミットチェック＆記録
 * パスワードリセットなど、ログインとは異なる設定が必要な場合に使用
 */
export function checkAndRecordCustomLimit(
  key: string,
  options: { maxAttempts: number; windowMs: number; blockMs: number }
): RateLimitResult {
  const now = Date.now();
  let rec = store.get(key);

  if (rec?.blockedUntil && rec.blockedUntil > now) {
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil((rec.blockedUntil - now) / 1000),
    };
  }

  if (!rec || now - rec.firstFailAt >= options.windowMs) {
    rec = { failCount: 0, firstFailAt: now };
  }

  rec.failCount++;

  if (rec.failCount >= options.maxAttempts) {
    rec.blockedUntil = now + options.blockMs;
    store.set(key, rec);
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil(options.blockMs / 1000),
    };
  }

  store.set(key, rec);
  return { allowed: true };
}
