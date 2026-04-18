import "server-only";
import { getSetting } from "./settings";

// Lark Open Platform API クライアント
// 国際版: https://open.larksuite.com
// APIトークンは2時間有効、メモリキャッシュで管理する

export class LarkApiError extends Error {
  constructor(
    message: string,
    public readonly code?: number,
  ) {
    super(message);
    this.name = "LarkApiError";
  }
}

// app_access_token キャッシュ
let tokenCache: { token: string; expiresAt: number } | null = null;

async function getBaseUrl(): Promise<string> {
  const url = await getSetting("LARK_API_BASE_URL");
  // 末尾スラッシュと誤って含まれた /open-apis パスを除去して正規化
  return (url ?? "https://open.larksuite.com")
    .replace(/\/open-apis(\/.*)?$/, "")
    .replace(/\/$/, "");
}

/**
 * app_access_token を取得（有効期限 2 時間、メモリキャッシュ付き）
 * POST /open-apis/auth/v3/app_access_token/internal
 */
export async function getAppAccessToken(): Promise<string> {
  // キャッシュが有効なら返す（期限の 5 分前に再取得）
  if (tokenCache && Date.now() < tokenCache.expiresAt - 5 * 60 * 1000) {
    return tokenCache.token;
  }

  const appId = await getSetting("LARK_APP_ID");
  const appSecret = await getSetting("LARK_APP_SECRET");

  if (!appId || !appSecret) {
    throw new LarkApiError(
      "Lark 認証情報が設定されていません。管理画面で LARK_APP_ID と LARK_APP_SECRET を設定してください。",
    );
  }

  const baseUrl = await getBaseUrl();
  const res = await fetch(`${baseUrl}/open-apis/auth/v3/app_access_token/internal`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ app_id: appId, app_secret: appSecret }),
  });

  if (!res.ok) {
    throw new LarkApiError(
      `Lark トークン取得失敗: HTTP ${res.status} (URL: ${baseUrl}/open-apis/auth/v3/app_access_token/internal)` +
      ` — LARK_API_BASE_URL の設定値が正しいか確認してください（正: https://open.larksuite.com）`,
    );
  }

  const tokenContentType = res.headers.get("content-type") ?? "";
  if (!tokenContentType.includes("application/json")) {
    const text = await res.text();
    throw new LarkApiError(
      `Lark トークン取得失敗: JSON 以外のレスポンスが返りました（content-type: ${tokenContentType}）。` +
      `LARK_APP_ID と LARK_APP_SECRET の値、および LARK_API_BASE_URL をご確認ください。` +
      ` [preview: ${text.slice(0, 200)}]`,
    );
  }

  const data = (await res.json()) as {
    code: number;
    msg: string;
    app_access_token?: string;
    expire?: number;
  };

  if (data.code !== 0 || !data.app_access_token) {
    throw new LarkApiError(`Lark トークン取得失敗: ${data.msg} (code: ${data.code})`, data.code);
  }

  const ttl = (data.expire ?? 7200) * 1000;
  tokenCache = { token: data.app_access_token, expiresAt: Date.now() + ttl };
  return tokenCache.token;
}

async function larkFetch<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const token = await getAppAccessToken();
  const baseUrl = await getBaseUrl();

  const res = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options?.headers ?? {}),
    },
  });

  if (!res.ok) {
    throw new LarkApiError(`Lark API エラー: HTTP ${res.status} ${path}`);
  }

  const contentType = res.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    const text = await res.text();
    const preview = text.slice(0, 200);
    throw new LarkApiError(
      `Lark API が JSON 以外を返しました（content-type: ${contentType}）。` +
      `LARK_APP_ID/LARK_APP_SECRET/LARK_BASE_APP_TOKEN の値か、Bot の権限・公開ステータスをご確認ください。` +
      ` [preview: ${preview}]`,
    );
  }

  const json = (await res.json()) as { code: number; msg: string; data?: T };

  if (json.code !== 0) {
    throw new LarkApiError(`Lark API エラー: ${json.msg} (code: ${json.code})`, json.code);
  }

  return json.data as T;
}

// ---------- 型定義 ----------

export interface LarkTable {
  table_id: string;
  name: string;
  revision: number;
}

export interface LarkFieldDef {
  field_name: string;
  type: number; // 1=text, 2=number, ...
}

export interface LarkRecord {
  record_id: string;
  fields: Record<string, unknown>;
  created_time?: number;
  last_modified_time?: number;
}

// ---------- Lark Base (Bitable) 操作 ----------

/**
 * テーブルのフィールド一覧を取得
 * GET /open-apis/bitable/v1/apps/{app_token}/tables/{table_id}/fields
 */
export async function listFields(
  appToken: string,
  tableId: string,
): Promise<{ field_id: string; field_name: string; type: number }[]> {
  const data = await larkFetch<{ items?: { field_id: string; field_name: string; type: number }[] }>(
    `/open-apis/bitable/v1/apps/${appToken}/tables/${tableId}/fields`,
  );
  return data.items ?? [];
}

/**
 * テーブルにフィールドを追加（既存フィールドは無視）
 * POST /open-apis/bitable/v1/apps/{app_token}/tables/{table_id}/fields
 */
export async function ensureFields(
  appToken: string,
  tableId: string,
  fields: LarkFieldDef[],
): Promise<void> {
  const existing = await listFields(appToken, tableId);
  const existingNames = new Set(existing.map((f) => f.field_name));
  for (const field of fields) {
    if (existingNames.has(field.field_name)) continue;
    await larkFetch<unknown>(
      `/open-apis/bitable/v1/apps/${appToken}/tables/${tableId}/fields`,
      {
        method: "POST",
        body: JSON.stringify({ field_name: field.field_name, type: field.type }),
      },
    );
  }
}

/**
 * テーブル一覧を取得
 * GET /open-apis/bitable/v1/apps/{app_token}/tables
 */
export async function listTables(appToken: string): Promise<LarkTable[]> {
  const data = await larkFetch<{ items?: LarkTable[] }>(
    `/open-apis/bitable/v1/apps/${appToken}/tables`,
  );
  return data.items ?? [];
}

/**
 * テーブルを作成
 * POST /open-apis/bitable/v1/apps/{app_token}/tables
 * @returns table_id
 */
export async function createTable(
  appToken: string,
  name: string,
  fields: LarkFieldDef[],
): Promise<string> {
  const data = await larkFetch<{ table_id: string }>(
    `/open-apis/bitable/v1/apps/${appToken}/tables`,
    {
      method: "POST",
      body: JSON.stringify({ table: { name, fields } }),
    },
  );
  return data.table_id;
}

/**
 * レコードを作成
 * POST /open-apis/bitable/v1/apps/{app_token}/tables/{table_id}/records
 * @returns record_id
 */
export async function createRecord(
  appToken: string,
  tableId: string,
  fields: Record<string, unknown>,
): Promise<string> {
  const data = await larkFetch<{ record: { record_id: string } }>(
    `/open-apis/bitable/v1/apps/${appToken}/tables/${tableId}/records`,
    {
      method: "POST",
      body: JSON.stringify({ fields }),
    },
  );
  return data.record.record_id;
}

/**
 * レコードを更新
 * PUT /open-apis/bitable/v1/apps/{app_token}/tables/{table_id}/records/{record_id}
 */
export async function updateRecord(
  appToken: string,
  tableId: string,
  recordId: string,
  fields: Record<string, unknown>,
): Promise<void> {
  await larkFetch<{ record: LarkRecord }>(
    `/open-apis/bitable/v1/apps/${appToken}/tables/${tableId}/records/${recordId}`,
    {
      method: "PUT",
      body: JSON.stringify({ fields }),
    },
  );
}

/**
 * レコードを削除
 * DELETE /open-apis/bitable/v1/apps/{app_token}/tables/{table_id}/records/{record_id}
 */
export async function deleteRecord(
  appToken: string,
  tableId: string,
  recordId: string,
): Promise<void> {
  await larkFetch<unknown>(
    `/open-apis/bitable/v1/apps/${appToken}/tables/${tableId}/records/${recordId}`,
    { method: "DELETE" },
  );
}

/**
 * 単一レコードを取得
 * GET /open-apis/bitable/v1/apps/{app_token}/tables/{table_id}/records/{record_id}
 */
export async function getRecord(
  appToken: string,
  tableId: string,
  recordId: string,
): Promise<LarkRecord | null> {
  try {
    const data = await larkFetch<{ record: LarkRecord }>(
      `/open-apis/bitable/v1/apps/${appToken}/tables/${tableId}/records/${recordId}`,
    );
    return data.record ?? null;
  } catch {
    return null;
  }
}

/**
 * 全レコードをページネーションして取得
 */
export async function listAllRecords(
  appToken: string,
  tableId: string,
  filter?: string,
): Promise<LarkRecord[]> {
  const all: LarkRecord[] = [];
  let pageToken: string | undefined;
  do {
    const result = await listRecords(appToken, tableId, {
      filter,
      pageSize: 500,
      pageToken,
    });
    all.push(...result.records);
    pageToken = result.hasMore ? result.pageToken : undefined;
  } while (pageToken);
  return all;
}

/**
 * レコードを一括作成（最大 500 件）
 * POST /open-apis/bitable/v1/apps/{app_token}/tables/{table_id}/records/batch_create
 * @returns 作成されたレコードIDの配列
 */
export async function batchCreateRecords(
  appToken: string,
  tableId: string,
  fieldsList: Record<string, unknown>[],
): Promise<string[]> {
  if (fieldsList.length === 0) return [];
  const data = await larkFetch<{ records: { record_id: string }[] }>(
    `/open-apis/bitable/v1/apps/${appToken}/tables/${tableId}/records/batch_create`,
    {
      method: "POST",
      body: JSON.stringify({ records: fieldsList.map((fields) => ({ fields })) }),
    },
  );
  return (data.records ?? []).map((r) => r.record_id);
}

/**
 * レコード一覧を取得
 * GET /open-apis/bitable/v1/apps/{app_token}/tables/{table_id}/records
 */
export async function listRecords(
  appToken: string,
  tableId: string,
  options?: {
    filter?: string;
    pageSize?: number;
    pageToken?: string;
  },
): Promise<{ records: LarkRecord[]; pageToken?: string; hasMore: boolean }> {
  const params = new URLSearchParams();
  if (options?.filter) params.set("filter", options.filter);
  if (options?.pageSize) params.set("page_size", String(options.pageSize));
  if (options?.pageToken) params.set("page_token", options.pageToken);

  const query = params.toString() ? `?${params.toString()}` : "";

  const data = await larkFetch<{
    items?: LarkRecord[];
    page_token?: string;
    has_more?: boolean;
  }>(`/open-apis/bitable/v1/apps/${appToken}/tables/${tableId}/records${query}`);

  return {
    records: data.items ?? [],
    pageToken: data.page_token,
    hasMore: data.has_more ?? false,
  };
}
