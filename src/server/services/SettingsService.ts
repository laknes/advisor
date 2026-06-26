import { prisma } from '@/lib/db';

export const defaultSiteSettings = [
  { key: 'site_name', value: 'سرمایه گذاری موسوی', group: 'general', label: 'نام فارسی سایت', type: 'text', isPublic: true },
  { key: 'site_name_en', value: 'mousavi invest', group: 'general', label: 'English site name', type: 'text', isPublic: true },
  { key: 'site_tagline', value: 'پلتفرم حرفه‌ای مشاوره سرمایه‌گذاری', group: 'general', label: 'Tagline', type: 'text', isPublic: true },
  { key: 'site_logo_url', value: '', group: 'general', label: 'Site logo URL', description: 'آدرس لوگوی سایت را وارد کنید. می‌تواند مسیر public مثل /logo.png یا لینک کامل تصویر باشد.', type: 'url', isPublic: true },
  { key: 'site_favicon_url', value: '/favicon.ico', group: 'general', label: 'Favicon URL', description: 'آدرس favicon سایت را وارد کنید. می‌تواند مسیر public مثل /favicon.ico یا لینک کامل تصویر باشد.', type: 'url', isPublic: true },
  { key: 'support_email', value: 'support@example.com', group: 'contact', label: 'Support email', type: 'email', isPublic: true },
  { key: 'support_phone', value: '', group: 'contact', label: 'Support phone', type: 'text', isPublic: true },
  { key: 'maintenance_mode', value: false, group: 'system', label: 'Maintenance mode', type: 'boolean', isPublic: false },
  { key: 'allow_signup', value: true, group: 'system', label: 'Allow signup', type: 'boolean', isPublic: true },
  { key: 'default_currency', value: 'IRR', group: 'billing', label: 'Default currency', type: 'text', isPublic: true },
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
  { key: 'market_data_default_free_provider', value: 'alpha_vantage', group: 'market_data_free', label: 'Default free market data provider', description: 'Supported values: alpha_vantage, finnhub, twelve_data, polygon, coingecko.', type: 'text', isPublic: false },
  { key: 'market_data_provider_priority', value: 'alpha_vantage,finnhub,twelve_data,polygon,coingecko', group: 'market_data_free', label: 'Provider priority order', description: 'Comma-separated fallback order for real market data providers.', type: 'text', isPublic: false },
  { key: 'alpha_vantage_enabled', value: true, group: 'market_data_free', label: 'Alpha Vantage enabled', description: 'Free key supports global equities, forex, crypto, commodities, economic indicators, and technical indicators. Docs: https://www.alphavantage.co/documentation/', type: 'boolean', isPublic: false },
  { key: 'alpha_vantage_base_url', value: 'https://www.alphavantage.co/query', group: 'market_data_free', label: 'Alpha Vantage base URL', type: 'text', isPublic: false },
  { key: 'alpha_vantage_api_key', value: '', group: 'market_data_free', label: 'Alpha Vantage API key', description: 'Get a free key from Alpha Vantage before enabling live calls.', type: 'password', isPublic: false },
  { key: 'alpha_vantage_docs_url', value: 'https://www.alphavantage.co/documentation/', group: 'market_data_free', label: 'Alpha Vantage docs URL', type: 'text', isPublic: false },
  { key: 'finnhub_enabled', value: false, group: 'market_data_free', label: 'Finnhub enabled', description: 'Free APIs cover realtime stock, forex, crypto, fundamentals, economic and alternative data. Docs: https://finnhub.io/docs/api', type: 'boolean', isPublic: false },
  { key: 'finnhub_base_url', value: 'https://finnhub.io/api/v1', group: 'market_data_free', label: 'Finnhub base URL', type: 'text', isPublic: false },
  { key: 'finnhub_api_key', value: '', group: 'market_data_free', label: 'Finnhub API key', type: 'password', isPublic: false },
  { key: 'finnhub_docs_url', value: 'https://finnhub.io/docs/api', group: 'market_data_free', label: 'Finnhub docs URL', type: 'text', isPublic: false },
  { key: 'twelve_data_enabled', value: false, group: 'market_data_free', label: 'Twelve Data enabled', description: 'Multi-asset market data API with a free tier. Docs: https://twelvedata.com/docs', type: 'boolean', isPublic: false },
  { key: 'twelve_data_base_url', value: 'https://api.twelvedata.com', group: 'market_data_free', label: 'Twelve Data base URL', type: 'text', isPublic: false },
  { key: 'twelve_data_api_key', value: '', group: 'market_data_free', label: 'Twelve Data API key', type: 'password', isPublic: false },
  { key: 'twelve_data_docs_url', value: 'https://twelvedata.com/docs', group: 'market_data_free', label: 'Twelve Data docs URL', type: 'text', isPublic: false },
  { key: 'polygon_enabled', value: false, group: 'market_data_free', label: 'Polygon / Massive enabled', description: 'Market data provider now branded as Massive. Docs: https://polygon.io/docs', type: 'boolean', isPublic: false },
  { key: 'polygon_base_url', value: 'https://api.polygon.io', group: 'market_data_free', label: 'Polygon / Massive base URL', type: 'text', isPublic: false },
  { key: 'polygon_api_key', value: '', group: 'market_data_free', label: 'Polygon / Massive API key', type: 'password', isPublic: false },
  { key: 'polygon_docs_url', value: 'https://polygon.io/docs', group: 'market_data_free', label: 'Polygon / Massive docs URL', type: 'text', isPublic: false },
  { key: 'coingecko_enabled', value: false, group: 'market_data_free', label: 'CoinGecko Demo API enabled', description: 'Free demo API for crypto market data with limited endpoints and rate limits. Docs: https://docs.coingecko.com/', type: 'boolean', isPublic: false },
  { key: 'coingecko_base_url', value: 'https://api.coingecko.com/api/v3', group: 'market_data_free', label: 'CoinGecko base URL', type: 'text', isPublic: false },
  { key: 'coingecko_api_key', value: '', group: 'market_data_free', label: 'CoinGecko API key', description: 'Optional for demo/pro setups depending on plan.', type: 'password', isPublic: false },
  { key: 'coingecko_docs_url', value: 'https://docs.coingecko.com/', group: 'market_data_free', label: 'CoinGecko docs URL', type: 'text', isPublic: false },
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
  { key: 'seo_title', value: 'سرمایه گذاری موسوی | mousavi invest', group: 'seo', label: 'SEO title', type: 'text', isPublic: true },
  { key: 'seo_description', value: 'Investment advisory, portfolio management, market analysis, and alerts.', group: 'seo', label: 'SEO description', type: 'textarea', isPublic: true },
] as const;

export class SettingsService {
  private static seedPromise: Promise<void> | null = null;

  private static async ensureSiteSettingsTable() {
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "site_settings" (
        "id" TEXT NOT NULL,
        "key" TEXT NOT NULL,
        "value" JSONB NOT NULL,
        "group" TEXT NOT NULL DEFAULT 'general',
        "label" TEXT NOT NULL,
        "description" TEXT,
        "type" TEXT NOT NULL DEFAULT 'text',
        "isPublic" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,

        CONSTRAINT "site_settings_pkey" PRIMARY KEY ("id")
      )
    `;

    await prisma.$executeRaw`
      CREATE UNIQUE INDEX IF NOT EXISTS "site_settings_key_key" ON "site_settings"("key")
    `;
  }

  private static async runSeedDefaults() {
    await this.ensureSiteSettingsTable();

    await prisma.siteSetting.createMany({
      data: [...defaultSiteSettings],
      skipDuplicates: true,
    });

    await prisma.siteSetting.updateMany({
      where: {
        key: 'site_name',
        OR: [{ value: { equals: 'Portfolio Advisor' } }, { value: { equals: 'مشاور پورتفو' } }],
      },
      data: { value: 'سرمایه گذاری موسوی' },
    });

    await prisma.siteSetting.updateMany({
      where: {
        key: 'seo_title',
        OR: [{ value: { equals: 'Portfolio Advisor' } }, { value: { equals: 'مشاور پورتفو' } }],
      },
      data: { value: 'سرمایه گذاری موسوی | mousavi invest' },
    });

    await prisma.siteSetting.updateMany({
      where: {
        key: 'site_tagline',
        value: { equals: 'Professional investment advisory platform' },
      },
      data: { value: 'پلتفرم حرفه‌ای مشاوره سرمایه‌گذاری' },
    });
  }

  static async seedDefaults() {
    this.seedPromise ??= this.runSeedDefaults().catch((error) => {
      this.seedPromise = null;
      throw error;
    });

    await this.seedPromise;
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
