import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail, buildWelcomeEmailHtml, buildInviteEmailHtml } from "@/lib/email";
import { getSetting } from "@/lib/settings";
import crypto from "crypto";

/**
 * UnivaPay Webhook ハンドラー
 *
 * 受け取るイベント:
 *   subscription_payment  — 定期支払い成功 → 会員を有効化
 *   subscription_failure  — 支払い失敗 → 会員を停止
 *   subscription_canceled — 解約 → 会員を停止
 */

interface UnivaPayWebhookBody {
  event: string;
  data?: {
    subscription_id?: string;
    merchant_id?: string;
    metadata?: Record<string, string>;
  };
}

/** UnivaPay の HMAC-SHA256 署名を検証する */
function verifySignature(body: string, secret: string, signature: string): boolean {
  try {
    const expected = crypto
      .createHmac("sha256", secret)
      .update(body)
      .digest("hex");
    return crypto.timingSafeEqual(
      Buffer.from(expected, "hex"),
      Buffer.from(signature, "hex")
    );
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("x-univapay-signature") ?? "";

  // シークレット取得（未設定の場合はWebhookを拒否）
  const appSecret = await getSetting("UNIVAPAY_APP_SECRET").catch(() => null);

  if (!appSecret) {
    console.error("[univapay webhook] UNIVAPAY_APP_SECRET is not configured");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  if (!verifySignature(body, appSecret, signature)) {
    console.error("[univapay webhook] Invalid signature");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: UnivaPayWebhookBody;
  try {
    payload = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { event, data } = payload;
  const subscriptionId = data?.subscription_id;
  const userEmail = data?.metadata?.email;
  const userName = data?.metadata?.name ?? "";

  console.log(`[univapay webhook] event=${event} subscription_id=${subscriptionId}`);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  switch (event) {
    case "subscription_payment": {
      // 支払い成功 → 会員を有効化してウェルカムメール送信
      if (subscriptionId) {
        // サブスクリプションIDで既存ユーザーを検索
        const user = await prisma.user.findFirst({
          where: { univaPaySubscriptionId: subscriptionId },
        });

        if (user) {
          // 既存ユーザー: isActive を true に
          await prisma.user.update({
            where: { id: user.id },
            data: { isActive: true },
          });
          // ウェルカムメール送信
          try {
            await sendEmail({
              to: user.email,
              subject: "【Living Me】ご入会ありがとうございます",
              html: buildWelcomeEmailHtml(user.name ?? "", `${appUrl}/login`),
            });
          } catch (err) {
            console.error("[univapay webhook] Failed to send welcome email:", err);
          }
        } else if (userEmail) {
          // メタデータからユーザーを検索（新規会員）
          const existingUser = await prisma.user.findUnique({ where: { email: userEmail } });

          if (existingUser) {
            // 既存ユーザーを有効化 + サブスクID紐付け
            await prisma.user.update({
              where: { id: existingUser.id },
              data: { isActive: true, univaPaySubscriptionId: subscriptionId },
            });
            try {
              await sendEmail({
                to: existingUser.email,
                subject: "【Living Me】ご入会ありがとうございます",
                html: buildWelcomeEmailHtml(existingUser.name ?? "", `${appUrl}/login`),
              });
            } catch (err) {
              console.error("[univapay webhook] Failed to send welcome email:", err);
            }
          } else {
            // 新規ユーザーを作成してパスワード設定メールを送信
            const newUser = await prisma.user.create({
              data: {
                email: userEmail,
                name: userName,
                isActive: true,
                univaPaySubscriptionId: subscriptionId,
                joinedAt: new Date(),
              },
            });

            // 招待トークンを発行してパスワード設定メールを送信
            const token = crypto.randomBytes(32).toString("hex");
            const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000); // 72時間

            await prisma.inviteToken.create({
              data: { token, email: userEmail, userId: newUser.id, expiresAt },
            });

            const inviteUrl = `${appUrl}/invite/${token}`;
            try {
              await sendEmail({
                to: userEmail,
                subject: "【Living Me】ご入会ありがとうございます — パスワードを設定してください",
                html: buildInviteEmailHtml(inviteUrl),
              });
            } catch (err) {
              console.error("[univapay webhook] Failed to send invite email:", err);
            }
          }
        }
      }

      // イベントを記録
      await prisma.univaPayEvent.create({
        data: {
          id: `${event}_${subscriptionId ?? ""}_${Date.now()}`,
          type: event,
          payload: { subscriptionId, metadata: data?.metadata ?? {} },
        },
      }).catch(() => null);

      break;
    }

    case "subscription_failure":
    case "subscription_canceled": {
      // 支払い失敗 / 解約 → 会員を停止
      if (subscriptionId) {
        await prisma.user.updateMany({
          where: { univaPaySubscriptionId: subscriptionId },
          data: { isActive: false },
        });
      }

      await prisma.univaPayEvent.create({
        data: {
          id: `${event}_${subscriptionId ?? ""}_${Date.now()}`,
          type: event,
          payload: { subscriptionId, metadata: data?.metadata ?? {} },
        },
      }).catch(() => null);

      break;
    }

    default:
      console.log(`[univapay webhook] Unhandled event: ${event}`);
  }

  return NextResponse.json({ received: true });
}
