import { prisma } from '@/lib/db';

export const defaultSiteSettings = [
  { key: 'site_name', value: 'Portfolio Advisor', group: 'general', label: 'Site name', type: 'text', isPublic: true },
  { key: 'site_tagline', value: 'Professional investment advisory platform', group: 'general', label: 'Tagline', type: 'text', isPublic: true },
  { key: 'support_email', value: 'support@example.com', group: 'contact', label: 'Support email', type: 'email', isPublic: true },
  { key: 'support_phone', value: '', group: 'contact', label: 'Support phone', type: 'text', isPublic: true },
  { key: 'maintenance_mode', value: false, group: 'system', label: 'Maintenance mode', type: 'boolean', isPublic: false },
  { key: 'allow_signup', value: true, group: 'system', label: 'Allow signup', type: 'boolean', isPublic: true },
  { key: 'default_currency', value: 'USD', group: 'billing', label: 'Default currency', type: 'text', isPublic: true },
  { key: 'payment_default_gateway', value: 'zarinpal', group: 'payments', label: 'Default Iranian payment gateway', description: 'Supported values: zarinpal, zibal, idpay, payir', type: 'text', isPublic: false },
  { key: 'payment_callback_url', value: '', group: 'payments', label: 'Payment callback URL', description: 'Public callback URL used after payment verification.', type: 'text', isPublic: false },
  { key: 'zarinpal_enabled', value: true, group: 'payments', label: 'Zarinpal enabled', type: 'boolean', isPublic: false },
  { key: 'zarinpal_merchant_id', value: '', group: 'payments', label: 'Zarinpal merchant ID', type: 'password', isPublic: false },
  { key: 'zarinpal_sandbox', value: true, group: 'payments', label: 'Zarinpal sandbox', type: 'boolean', isPublic: false },
  { key: 'zibal_enabled', value: false, group: 'payments', label: 'Zibal enabled', type: 'boolean', isPublic: false },
  { key: 'zibal_merchant', value: '', group: 'payments', label: 'Zibal merchant', type: 'password', isPublic: false },
  { key: 'idpay_enabled', value: false, group: 'payments', label: 'IDPay enabled', type: 'boolean', isPublic: false },
  { key: 'idpay_api_key', value: '', group: 'payments', label: 'IDPay API key', type: 'password', isPublic: false },
  { key: 'payir_enabled', value: false, group: 'payments', label: 'Pay.ir enabled', type: 'boolean', isPublic: false },
  { key: 'payir_api_key', value: '', group: 'payments', label: 'Pay.ir API key', type: 'password', isPublic: false },
  { key: 'market_data_enabled', value: true, group: 'market_data', label: 'Market data sync enabled', type: 'boolean', isPublic: false },
  { key: 'market_data_refresh_seconds', value: '300', group: 'market_data', label: 'Refresh interval seconds', type: 'number', isPublic: false },
  { key: 'tsetmc_enabled', value: true, group: 'market_data', label: 'TSETMC / Tehran market enabled', type: 'boolean', isPublic: false },
  { key: 'tsetmc_prices_url', value: '', group: 'market_data', label: 'TSETMC prices API URL', description: 'Expected JSON: an array, or { prices: [...] }, with symbol/currentPrice fields.', type: 'text', isPublic: false },
  { key: 'tsetmc_api_key', value: '', group: 'market_data', label: 'TSETMC API key', type: 'password', isPublic: false },
  { key: 'forex_enabled', value: true, group: 'market_data', label: 'Forex data enabled', type: 'boolean', isPublic: false },
  { key: 'forex_prices_url', value: '', group: 'market_data', label: 'Forex prices API URL', type: 'text', isPublic: false },
  { key: 'forex_api_key', value: '', group: 'market_data', label: 'Forex API key', type: 'password', isPublic: false },
  { key: 'gold_enabled', value: true, group: 'market_data', label: 'Gold data enabled', type: 'boolean', isPublic: false },
  { key: 'gold_prices_url', value: '', group: 'market_data', label: 'Gold prices API URL', type: 'text', isPublic: false },
  { key: 'gold_api_key', value: '', group: 'market_data', label: 'Gold API key', type: 'password', isPublic: false },
  { key: 'currency_enabled', value: true, group: 'market_data', label: 'Currency data enabled', type: 'boolean', isPublic: false },
  { key: 'currency_prices_url', value: '', group: 'market_data', label: 'Currency prices API URL', type: 'text', isPublic: false },
  { key: 'currency_api_key', value: '', group: 'market_data', label: 'Currency API key', type: 'password', isPublic: false },
  { key: 'crypto_enabled', value: false, group: 'market_data', label: 'Crypto data enabled', type: 'boolean', isPublic: false },
  { key: 'crypto_prices_url', value: '', group: 'market_data', label: 'Crypto prices API URL', type: 'text', isPublic: false },
  { key: 'crypto_api_key', value: '', group: 'market_data', label: 'Crypto API key', type: 'password', isPublic: false },
  { key: 'hero_title', value: 'مشاوره سرمایه‌گذاری هوشمند', group: 'content', label: 'Hero title', type: 'text', isPublic: true },
  { key: 'hero_subtitle', value: 'تحلیل‌های تخصصی، مدیریت پورتفو و دیدبان زنده بازار را در یک تجربه فارسی، سریع و شفاف دنبال کنید.', group: 'content', label: 'Hero subtitle', type: 'textarea', isPublic: true },
  { key: 'seo_title', value: 'Portfolio Advisor', group: 'seo', label: 'SEO title', type: 'text', isPublic: true },
  { key: 'seo_description', value: 'Investment advisory, portfolio management, market analysis, and alerts.', group: 'seo', label: 'SEO description', type: 'textarea', isPublic: true },
] as const;

export class SettingsService {
  static async seedDefaults() {
    await Promise.all(
      defaultSiteSettings.map((setting) =>
        prisma.siteSetting.upsert({
          where: { key: setting.key },
          create: setting,
          update: {},
        }),
      ),
    );
  }

  static async getSettings(publicOnly = false) {
    await this.seedDefaults();

    const settings = await prisma.siteSetting.findMany({
      where: publicOnly ? { isPublic: true } : undefined,
      orderBy: [{ group: 'asc' }, { label: 'asc' }],
    });

    return settings;
  }

  static async getPublicSettingsMap() {
    const settings = await this.getSettings(true);
    return Object.fromEntries(settings.map((setting) => [setting.key, setting.value]));
  }

  static async updateSettings(items: Array<{ key: string; value: unknown }>) {
    await this.seedDefaults();

    await prisma.$transaction(
      items.map((item) =>
        prisma.siteSetting.update({
          where: { key: item.key },
          data: { value: item.value as any },
        }),
      ),
    );

    return this.getSettings(false);
  }
}
