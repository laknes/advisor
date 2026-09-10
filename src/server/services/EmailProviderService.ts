type SendResult = { ok: boolean; error?: string };

type PasswordResetPayload = {
  to: string;
  name?: string | null;
  token: string;
};

function asString(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function resolveBaseUrl() {
  return asString(process.env.NEXTAUTH_URL)
    || asString(process.env.NEXT_PUBLIC_APP_URL)
    || 'http://localhost:3000';
}

function resolveFromAddress() {
  return asString(process.env.EMAIL_FROM)
    || asString(process.env.SMTP_USER)
    || 'no-reply@localhost';
}

function buildResetMessage(payload: PasswordResetPayload) {
  const baseUrl = resolveBaseUrl();
  const tokenParam = encodeURIComponent(payload.token);
  const emailParam = encodeURIComponent(payload.to);
  const resetUrl = `${baseUrl}/fa/auth/forgot-password?token=${tokenParam}&email=${emailParam}`;
  const recipientName = payload.name?.trim() || 'کاربر گرامی';

  const subject = 'بازیابی رمز عبور';
  const text = [
    `${recipientName}،`,
    '',
    'درخواست بازیابی رمز عبور برای حساب شما ثبت شده است.',
    `کد بازیابی: ${payload.token}`,
    `لینک بازیابی: ${resetUrl}`,
    '',
    'اگر این درخواست توسط شما ثبت نشده است، این پیام را نادیده بگیرید.',
  ].join('\n');

  const html = `
    <div style="font-family:Tahoma,Arial,sans-serif;line-height:1.8;color:#0f172a;max-width:640px;margin:0 auto;padding:24px;border:1px solid #e2e8f0;border-radius:12px;background:#ffffff;">
      <h2 style="margin:0 0 12px;">بازیابی رمز عبور</h2>
      <p style="margin:0 0 10px;">${recipientName}، درخواست بازیابی رمز عبور برای حساب شما ثبت شده است.</p>
      <p style="margin:0 0 8px;">کد بازیابی:</p>
      <p style="margin:0 0 16px;font-size:20px;font-weight:700;letter-spacing:2px;">${payload.token}</p>
      <p style="margin:0 0 8px;">یا از لینک زیر استفاده کنید:</p>
      <p style="margin:0 0 18px;"><a href="${resetUrl}">${resetUrl}</a></p>
      <p style="margin:0;color:#475569;font-size:13px;">اگر این درخواست توسط شما ثبت نشده است، این پیام را نادیده بگیرید.</p>
    </div>
  `;

  return { subject, text, html };
}

async function sendViaResend(payload: PasswordResetPayload): Promise<SendResult> {
  const apiKey = asString(process.env.RESEND_API_KEY);
  if (!apiKey) return { ok: false, error: 'RESEND_API_KEY is not configured' };

  const from = resolveFromAddress();
  const message = buildResetMessage(payload);

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      from,
      to: [payload.to],
      subject: message.subject,
      text: message.text,
      html: message.html,
    }),
  });

  if (!response.ok) {
    return { ok: false, error: `Resend responded with HTTP ${response.status}` };
  }

  return { ok: true };
}

async function sendViaBrevo(payload: PasswordResetPayload): Promise<SendResult> {
  const apiKey = asString(process.env.BREVO_API_KEY);
  if (!apiKey) return { ok: false, error: 'BREVO_API_KEY is not configured' };

  const fromEmail = resolveFromAddress();
  const fromName = asString(process.env.EMAIL_FROM_NAME) || 'Portfolio Advisor';
  const message = buildResetMessage(payload);

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': apiKey,
    },
    body: JSON.stringify({
      sender: { email: fromEmail, name: fromName },
      to: [{ email: payload.to, name: payload.name?.trim() || undefined }],
      subject: message.subject,
      htmlContent: message.html,
      textContent: message.text,
    }),
  });

  if (!response.ok) {
    return { ok: false, error: `Brevo responded with HTTP ${response.status}` };
  }

  return { ok: true };
}

export class EmailProviderService {
  static async sendPasswordReset(payload: PasswordResetPayload) {
    const provider = asString(process.env.EMAIL_PROVIDER).toLowerCase() || (process.env.NODE_ENV === 'production' ? 'resend' : 'manual');

    if (provider === 'manual') {
      if (process.env.NODE_ENV === 'production') {
        console.error('[password-reset:manual] Manual password reset delivery is disabled in production. Configure EMAIL_PROVIDER.');
        return;
      }
      console.info(`[password-reset:manual] ${payload.to} -> ${payload.token}`);
      return;
    }

    try {
      const result = await this.dispatch(provider, payload);
      if (!result.ok) {
        console.error(`[password-reset:${provider}] send failed for ${payload.to}: ${result.error}`);
      }
    } catch (error) {
      console.error(`[password-reset:${provider}] send threw for ${payload.to}:`, error instanceof Error ? error.message : error);
    }
  }

  private static dispatch(provider: string, payload: PasswordResetPayload): Promise<SendResult> {
    switch (provider) {
      case 'resend':
        return sendViaResend(payload);
      case 'brevo':
        return sendViaBrevo(payload);
      default:
        return Promise.resolve({ ok: false, error: `Unknown email provider "${provider}"` });
    }
  }
}
