// Dispatches OTP codes to well-known Iranian SMS gateways configured in site settings.

type SendResult = { ok: boolean; error?: string };

function asString(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

async function sendViaKavenegar(phone: string, code: string, settings: Record<string, unknown>): Promise<SendResult> {
  const apiKey = asString(settings.kavenegar_api_key);
  const template = asString(settings.kavenegar_template);
  if (!apiKey || !template) return { ok: false, error: 'Kavenegar API key or template is not configured' };

  const url = `https://api.kavenegar.com/v1/${encodeURIComponent(apiKey)}/verify/lookup.json`;
  const params = new URLSearchParams({ receptor: phone, token: code, template });
  const response = await fetch(`${url}?${params.toString()}`);
  if (!response.ok) return { ok: false, error: `Kavenegar responded with HTTP ${response.status}` };
  return { ok: true };
}

async function sendViaMelipayamak(phone: string, code: string, settings: Record<string, unknown>): Promise<SendResult> {
  const username = asString(settings.melipayamak_username);
  const password = asString(settings.melipayamak_password);
  const bodyId = asString(settings.melipayamak_pattern_code);
  if (!username || !password || !bodyId) return { ok: false, error: 'Melipayamak username, password, or pattern code is not configured' };

  const response = await fetch('https://rest.payamak-panel.com/api/SendSMS/BaseNumber2', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password, text: code, to: phone, bodyId }),
  });
  if (!response.ok) return { ok: false, error: `Melipayamak responded with HTTP ${response.status}` };
  return { ok: true };
}

async function sendViaSmsIr(phone: string, code: string, settings: Record<string, unknown>): Promise<SendResult> {
  const apiKey = asString(settings.sms_ir_api_key);
  const templateId = asString(settings.sms_ir_template_id);
  if (!apiKey || !templateId) return { ok: false, error: 'SMS.ir API key or template ID is not configured' };

  const response = await fetch('https://api.sms.ir/v1/send/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-API-KEY': apiKey },
    body: JSON.stringify({
      mobile: phone,
      templateId: Number(templateId),
      parameters: [{ name: 'CODE', value: code }],
    }),
  });
  if (!response.ok) return { ok: false, error: `SMS.ir responded with HTTP ${response.status}` };
  return { ok: true };
}

async function sendViaIppanel(phone: string, code: string, settings: Record<string, unknown>): Promise<SendResult> {
  const apiKey = asString(settings.ippanel_api_key);
  const originator = asString(settings.ippanel_originator);
  const patternCode = asString(settings.ippanel_pattern_code);
  if (!apiKey || !originator || !patternCode) return { ok: false, error: 'IPPanel API key, originator, or pattern code is not configured' };

  const response = await fetch('https://api2.ippanel.com/api/v1/sms/pattern/normal/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: apiKey },
    body: JSON.stringify({
      code: patternCode,
      sender: originator,
      recipient: phone,
      variable: { 'verification-code': code },
    }),
  });
  if (!response.ok) return { ok: false, error: `IPPanel responded with HTTP ${response.status}` };
  return { ok: true };
}

export const SMS_PROVIDER_OPTIONS = ['manual', 'kavenegar', 'melipayamak', 'sms_ir', 'ippanel'] as const;
export type SmsProvider = (typeof SMS_PROVIDER_OPTIONS)[number];

export class SmsProviderService {
  /**
   * Sends an OTP code through the configured provider. Never throws so OTP issuance
   * always succeeds; delivery failures are logged for the admin to investigate.
   */
  static async send(phone: string, code: string, settings: Record<string, unknown>) {
    const provider = asString(settings.otp_sms_provider) || (process.env.NODE_ENV === 'production' ? 'kavenegar' : 'manual');

    if (provider === 'manual') {
      if (process.env.NODE_ENV === 'production') {
        console.error('[otp:manual] Manual OTP delivery is disabled in production. Configure a real SMS provider.');
        return;
      }
      console.info(`[otp:manual] ${phone} -> ${code}`);
      return;
    }

    try {
      const result = await this.dispatch(provider, phone, code, settings);
      if (!result.ok) {
        console.error(`[otp:${provider}] send failed for ${phone}: ${result.error}`);
      }
    } catch (error) {
      console.error(`[otp:${provider}] send threw for ${phone}:`, error instanceof Error ? error.message : error);
    }
  }

  private static dispatch(provider: string, phone: string, code: string, settings: Record<string, unknown>): Promise<SendResult> {
    switch (provider) {
      case 'kavenegar':
        return sendViaKavenegar(phone, code, settings);
      case 'melipayamak':
        return sendViaMelipayamak(phone, code, settings);
      case 'sms_ir':
        return sendViaSmsIr(phone, code, settings);
      case 'ippanel':
        return sendViaIppanel(phone, code, settings);
      default:
        return Promise.resolve({ ok: false, error: `Unknown SMS provider "${provider}"` });
    }
  }
}
