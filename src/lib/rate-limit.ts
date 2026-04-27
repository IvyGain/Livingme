/**
 * レートリミッター（Upstash Redis 対応 + in-memory フォールバック）
 *
 * UPSTASH_REDIS_REST_URL と UPSTASH_REDIS_REST_TOKEN が設定されていれば
 * Upstash Redis (REST) を使用。未設定なら in-memory にフォールバック。
 *
 * Vercel など水平スケールする環境では Upstash 必須。
 * `docs/DEPLOY.md` の Upstash セットアップ手順を参照。
 */

interface RateLimitRecord {
  failCount: number;
  firstFailAt: number;
  blockedUntil?: number;
}

const memoryStore = new Map<string, RateLimitRecord>();

const MAX_FAILS = 5;
const WINDOW_MS = 15 * 60_000; // 15分
const BLOCK_MS = 15 * 60_000;  // 15分ブロック

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
const USE_UPSTASH = !!(UPSTASH_URL && UPSTASH_TOKEN);

// 古いエントリを定期削除（in-memory のみ）
if (!USE_UPSTASH) {
  setInterval(() => {
    const now = Date.now();
    for (const [key, rec] of memoryStore.entries()) {
      const expired = rec.blockedUntil
        ? rec.blockedUntil < now
        : now - rec.firstFailAt > WINDOW_MS;
      if (expired) memoryStore.delete(key);
    }
  }, 5 * 60_000);
}

export interface RateLimitResult {
  allowed: boolean;
  /** ブロック解除までの残秒数（blockedの場合のみ） */
  retryAfterSeconds?: number;
}

// ── Upstash REST helpers ──────────────────────────────────────────────
async function upstashCommand<T>(args: (string | number)[]): Promise<T | null> {
  if (!USE_UPSTASH) return null;
  try {
    const res = await fetch(`${UPSTASH_URL}/${args.map(String).map(encodeURIComponent).join("/")}`, {
      headers: { Authorization: `Bearer ${UPSTASH_TOKEN}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { result: T };
    return json.result;
  } catch {
    return null;
  }
}

async function upstashGet(key: string): Promise<RateLimitRecord | null> {
  const raw = await upstashCommand<string>(["GET", `rl:${key}`]);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as RateLimitRecord;
  } catch {
    return null;
  }
}

async function upstashSet(key: string, rec: RateLimitRecord, ttlSec: number): Promise<void> {
  await upstashCommand(["SET", `rl:${key}`, JSON.stringify(rec), "EX", ttlSec]);
}

async function upstashDel(key: string): Promise<void> {
  await upstashCommand(["DEL", `rl:${key}`]);
}

// ── 公開 API（Upstash がなければ memory にフォールバック） ─────────
async function getRecord(key: string): Promise<RateLimitRecord | undefined> {
  if (USE_UPSTASH) {
    const r = await upstashGet(key);
    return r ?? undefined;
  }
  return memoryStore.get(key);
}

async function setRecord(key: string, rec: RateLimitRecord, ttlMs: number): Promise<void> {
  if (USE_UPSTASH) {
    await upstashSet(key, rec, Math.max(60, Math.ceil(ttlMs / 1000)));
    return;
  }
  memoryStore.set(key, rec);
}

async function deleteRecord(key: string): Promise<void> {
  if (USE_UPSTASH) {
    await upstashDel(key);
    return;
  }
  memoryStore.delete(key);
}

/** 現在のレート状態を確認（副作用なし） */
export async function checkRateLimit(key: string): Promise<RateLimitResult> {
  const now = Date.now();
  const rec = await getRecord(key);
  if (!rec) return { allowed: true };

  if (rec.blockedUntil && rec.blockedUntil > now) {
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil((rec.blockedUntil - now) / 1000),
    };
  }
  if (now - rec.firstFailAt >= WINDOW_MS) return { allowed: true };
  return { allowed: true };
}

/** ログイン失敗を記録する */
export async function recordFailure(key: string): Promise<RateLimitResult> {
  const now = Date.now();
  let rec = await getRecord(key);

  if (!rec || now - rec.firstFailAt >= WINDOW_MS) {
    rec = { failCount: 0, firstFailAt: now };
  }

  rec.failCount++;

  if (rec.failCount >= MAX_FAILS) {
    rec.blockedUntil = now + BLOCK_MS;
    await setRecord(key, rec, BLOCK_MS);
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil(BLOCK_MS / 1000),
    };
  }

  await setRecord(key, rec, WINDOW_MS);
  return { allowed: true };
}

/** ログイン成功時にカウンターをリセット */
export async function clearFailures(key: string): Promise<void> {
  await deleteRecord(key);
}

/**
 * カスタム閾値でのレートリミットチェック＆記録
 * パスワードリセットなど、ログインとは異なる設定が必要な場合に使用
 */
export async function checkAndRecordCustomLimit(
  key: string,
  options: { maxAttempts: number; windowMs: number; blockMs: number },
): Promise<RateLimitResult> {
  const now = Date.now();
  let rec = await getRecord(key);

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
    await setRecord(key, rec, options.blockMs);
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil(options.blockMs / 1000),
    };
  }

  await setRecord(key, rec, options.windowMs);
  return { allowed: true };
}
