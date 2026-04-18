import nodemailer from "nodemailer";

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

/**
 * Gmail SMTP でメールを送信する
 *
 * 必要な環境変数:
 *   GMAIL_USER         送信元 Gmail アドレス (例: yourname@gmail.com)
 *   GMAIL_APP_PASSWORD Google アカウントのアプリパスワード (通常のパスワードではない)
 *
 * アプリパスワードの取得手順:
 *   1. Google アカウント → セキュリティ → 2段階認証プロセスを有効化
 *   2. セキュリティ → アプリパスワード → 「メール」「その他」で生成
 *   3. 生成された16桁のパスワードを GMAIL_APP_PASSWORD に設定
 */
export async function sendEmail({ to, subject, html }: SendEmailOptions): Promise<void> {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;

  if (!user || !pass) {
    throw new Error("GMAIL_USER または GMAIL_APP_PASSWORD が設定されていません");
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });

  const from = process.env.EMAIL_FROM ?? `Living Me <${user}>`;

  await transporter.sendMail({ from, to, subject, html });
}

export function buildInviteEmailHtml(inviteUrl: string, expiresHours = 72, greeting?: string): string {
  const greetingText = greeting ?? "Living Me へご招待いたします。\n下記のボタンからパスワードを設定して、会員登録を完了させてください。";
  const greetingHtml = greetingText.split("\n").join("<br />");
  return `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Living Me へのご招待</title>
</head>
<body style="margin:0;padding:0;background:#FFF8F0;font-family:sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FFF8F0;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="480" cellpadding="0" cellspacing="0" style="background:#FEFCF8;border-radius:12px;border:1px solid #e8ddd5;overflow:hidden;">
          <tr>
            <td style="padding:40px 40px 24px;border-bottom:1px solid #f0ebe5;">
              <h1 style="margin:0;font-size:28px;font-weight:300;letter-spacing:0.2em;color:#6B4F3A;">Living Me</h1>
              <p style="margin:8px 0 0;font-size:13px;color:#9a8070;">あなたのリビングへようこそ</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 40px;">
              <h2 style="margin:0 0 16px;font-size:18px;font-weight:500;color:#4a3728;">会員登録のご招待</h2>
              <p style="margin:0 0 24px;font-size:14px;line-height:1.7;color:#6b5a4e;">
                ${greetingHtml}
              </p>
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="border-radius:8px;background:#6B4F3A;">
                    <a href="${inviteUrl}" style="display:block;padding:14px 32px;font-size:14px;font-weight:500;color:#fff;text-decoration:none;letter-spacing:0.05em;">
                      パスワードを設定する
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:24px 0 0;font-size:12px;color:#9a8070;">
                このリンクは ${expiresHours} 時間有効です。<br />
                ボタンが機能しない場合は以下のURLをコピーしてブラウザに貼り付けてください。
              </p>
              <p style="margin:8px 0 0;font-size:11px;color:#b0a090;word-break:break-all;">
                ${inviteUrl}
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 40px;border-top:1px solid #f0ebe5;">
              <p style="margin:0;font-size:11px;color:#b0a090;">
                このメールに心当たりがない場合は、そのまま削除していただいて構いません。
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/** ユニバペイ決済完了後に送るウェルカムメール */
export function buildWelcomeEmailHtml(name: string, loginUrl: string, greeting?: string): string {
  const displayName = name || "会員";
  const greetingText = greeting ?? "決済が完了し、Living Me の会員登録が正式に完了しました。\n下記のボタンからログインして、コンテンツをお楽しみください。";
  const greetingHtml = greetingText.split("\n").join("<br />");
  return `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Living Me へようこそ</title>
</head>
<body style="margin:0;padding:0;background:#FFF8F0;font-family:sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FFF8F0;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="480" cellpadding="0" cellspacing="0" style="background:#FEFCF8;border-radius:12px;border:1px solid #e8ddd5;overflow:hidden;">
          <tr>
            <td style="padding:40px 40px 24px;border-bottom:1px solid #f0ebe5;">
              <h1 style="margin:0;font-size:28px;font-weight:300;letter-spacing:0.2em;color:#6B4F3A;">Living Me</h1>
              <p style="margin:8px 0 0;font-size:13px;color:#9a8070;">あなたのリビングへようこそ</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 40px;">
              <h2 style="margin:0 0 16px;font-size:18px;font-weight:500;color:#4a3728;">
                ${displayName} さん、ご入会ありがとうございます！
              </h2>
              <p style="margin:0 0 24px;font-size:14px;line-height:1.7;color:#6b5a4e;">
                ${greetingHtml}
              </p>
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="border-radius:8px;background:#C07052;">
                    <a href="${loginUrl}" style="display:block;padding:14px 32px;font-size:14px;font-weight:500;color:#fff;text-decoration:none;letter-spacing:0.05em;">
                      Living Me にログインする
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:28px 0 0;font-size:13px;color:#6b5a4e;line-height:1.7;">
                ご不明な点がございましたら、このメールへの返信でお気軽にご連絡ください。
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 40px;border-top:1px solid #f0ebe5;">
              <p style="margin:0;font-size:11px;color:#b0a090;">
                このメールは Living Me 会員登録の完了をお知らせするものです。
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
