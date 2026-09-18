import { prisma } from '@/lib/db';

export const defaultSiteSettings = [
  { key: 'site_name', value: 'سرمایه گذاری موسوی', group: 'general', label: 'نام فارسی سایت', type: 'text', isPublic: true },
  { key: 'site_name_en', value: 'mousavi invest', group: 'general', label: 'English site name', type: 'text', isPublic: true },
  { key: 'site_tagline', value: 'پلتفرم حرفه‌ای مشاوره سرمایه‌گذاری', group: 'general', label: 'Tagline', type: 'text', isPublic: true },
  { key: 'site_logo_url', value: '', group: 'general', label: 'Site logo URL', description: 'آدرس لوگوی سایت را وارد کنید. می‌تواند مسیر public مثل /logo.png یا لینک کامل تصویر باشد.', type: 'url', isPublic: true },
  { key: 'site_favicon_url', value: '/favicon.ico', group: 'general', label: 'Favicon URL', description: 'آدرس favicon سایت را وارد کنید. می‌تواند مسیر public مثل /favicon.ico یا لینک کامل تصویر باشد.', type: 'url', isPublic: true },
  { key: 'contact_menu_enabled', value: true, group: 'contact', label: 'Contact menu enabled', description: 'نمایش یا عدم نمایش منوی تماس با ما در هدر سایت.', type: 'boolean', isPublic: true },
  { key: 'support_email', value: 'support@example.com', group: 'contact', label: 'Support email', type: 'email', isPublic: true },
  { key: 'support_phone', value: '', group: 'contact', label: 'Support phone', type: 'text', isPublic: true },
  { key: 'online_chat_url', value: '', group: 'contact', label: 'Online chat URL', description: 'لینک چت آنلاین، واتساپ، Crisp، Tawk یا هر سرویس چت دیگر.', type: 'url', isPublic: true },
  { key: 'online_chat_label', value: 'چت آنلاین', group: 'contact', label: 'Online chat label', type: 'text', isPublic: true },
  { key: 'support_ticket_enabled', value: true, group: 'contact', label: 'Ticket submission enabled', type: 'boolean', isPublic: true },
  { key: 'telegram_url', value: '', group: 'contact', label: 'Telegram URL', type: 'url', isPublic: true },
  { key: 'instagram_url', value: '', group: 'contact', label: 'Instagram URL', type: 'url', isPublic: true },
  { key: 'whatsapp_url', value: '', group: 'contact', label: 'WhatsApp URL', type: 'url', isPublic: true },
  { key: 'linkedin_url', value: '', group: 'contact', label: 'LinkedIn URL', type: 'url', isPublic: true },
  { key: 'contact_note', value: 'برای دریافت سریع‌ترین پاسخ، تیکت ثبت کنید یا از چت آنلاین استفاده کنید.', group: 'contact', label: 'Contact menu note', type: 'textarea', isPublic: true },
  { key: 'maintenance_mode', value: false, group: 'system', label: 'Maintenance mode', type: 'boolean', isPublic: false },
  { key: 'allow_signup', value: true, group: 'system', label: 'Allow signup', type: 'boolean', isPublic: true },
  { key: 'otp_enabled', value: true, group: 'otp', label: 'OTP login enabled', description: 'فعال بودن ورود و تایید شماره موبایل با کد یکبار مصرف.', type: 'boolean', isPublic: true },
  { key: 'otp_code_length', value: 6, group: 'otp', label: 'OTP code length', description: 'تعداد ارقام کد یکبار مصرف.', type: 'number', isPublic: false },
  { key: 'otp_ttl_minutes', value: 5, group: 'otp', label: 'OTP expiry minutes', description: 'مدت اعتبار کد یکبار مصرف به دقیقه.', type: 'number', isPublic: false },
  { key: 'otp_resend_seconds', value: 60, group: 'otp', label: 'OTP resend delay seconds', description: 'حداقل فاصله بین دو درخواست کد برای یک شماره.', type: 'number', isPublic: false },
  { key: 'otp_max_attempts', value: 5, group: 'otp', label: 'OTP max attempts', description: 'حداکثر دفعات تلاش برای وارد کردن هر کد.', type: 'number', isPublic: false },
  { key: 'otp_dev_show_code', value: false, group: 'otp', label: 'Show OTP code in development', description: 'این گزینه فقط برای محیط توسعه است و در production باید غیرفعال بماند.', type: 'boolean', isPublic: false },
  { key: 'otp_sms_provider', value: 'kavenegar', group: 'otp', label: 'SMS provider', description: 'سرویس ارسال پیامک کد یکبار مصرف. برای production یکی از سرویس‌های واقعی را همراه با کلید API تنظیم کنید.', type: 'select', isPublic: false },
  { key: 'otp_sms_api_key', value: '', group: 'otp', label: 'SMS API key (legacy)', description: 'فقط برای سازگاری با نسخه‌های قدیمی؛ تنظیمات هر سرویس در بخش مربوط به همان سرویس در پایین انجام می‌شود.', type: 'password', isPublic: false },
  { key: 'otp_sms_sender', value: '', group: 'otp', label: 'SMS sender number (legacy)', description: 'فقط برای سازگاری با نسخه‌های قدیمی؛ تنظیمات هر سرویس در بخش مربوط به همان سرویس در پایین انجام می‌شود.', type: 'text', isPublic: false },
  { key: 'kavenegar_api_key', value: '', group: 'otp', label: 'Kavenegar API key', description: 'کلید API پنل کاوه‌نگار. مستندات: https://kavenegar.com/rest.html', type: 'password', isPublic: false },
  { key: 'kavenegar_template', value: '', group: 'otp', label: 'Kavenegar OTP template', description: 'نام الگوی Verify Lookup ساخته‌شده در پنل کاوه‌نگار برای ارسال کد یکبار مصرف.', type: 'text', isPublic: false },
  { key: 'melipayamak_username', value: '', group: 'otp', label: 'Melipayamak username', description: 'نام کاربری پنل ملی‌پیامک. مستندات: https://www.melipayamak.com/api/', type: 'text', isPublic: false },
  { key: 'melipayamak_password', value: '', group: 'otp', label: 'Melipayamak password', type: 'password', isPublic: false },
  { key: 'melipayamak_pattern_code', value: '', group: 'otp', label: 'Melipayamak pattern code', description: 'شناسه پترن (bodyId) ساخته‌شده در پنل برای ارسال کد یکبار مصرف.', type: 'text', isPublic: false },
  { key: 'sms_ir_api_key', value: '', group: 'otp', label: 'SMS.ir API key', description: 'کلید API پنل SMS.ir. مستندات: https://app.sms.ir/developer/index', type: 'password', isPublic: false },
  { key: 'sms_ir_template_id', value: '', group: 'otp', label: 'SMS.ir template ID', description: 'شناسه الگوی Verify ساخته‌شده در پنل SMS.ir برای ارسال کد یکبار مصرف.', type: 'text', isPublic: false },
  { key: 'ippanel_api_key', value: '', group: 'otp', label: 'IPPanel API key', description: 'کلید API پنل IPPanel. مستندات: https://ippanel.com/', type: 'password', isPublic: false },
  { key: 'ippanel_originator', value: '', group: 'otp', label: 'IPPanel sender line', description: 'شماره خط ارسال‌کننده پیامک ثبت‌شده در پنل IPPanel.', type: 'text', isPublic: false },
  { key: 'ippanel_pattern_code', value: '', group: 'otp', label: 'IPPanel pattern code', description: 'شناسه الگوی پیامک ساخته‌شده در پنل IPPanel برای ارسال کد یکبار مصرف.', type: 'text', isPublic: false },
  { key: 'default_currency', value: 'IRR', group: 'billing', label: 'Default currency', type: 'text', isPublic: true },
  { key: 'payment_default_gateway', value: 'zarinpal', group: 'payments', label: 'Default Iranian payment gateway', description: 'Supported values: zarinpal, zibal, idpay, payir', type: 'text', isPublic: false },
  { key: 'payment_callback_url', value: '', group: 'payments', label: 'Payment callback URL', description: 'Public callback URL used after payment verification.', type: 'text', isPublic: false },
  { key: 'zarinpal_enabled', value: true, group: 'payments', label: 'Zarinpal enabled', type: 'boolean', isPublic: false },
  { key: 'zarinpal_merchant_id', value: '', group: 'payments', label: 'Zarinpal merchant ID', type: 'password', isPublic: false },
  { key: 'zarinpal_sandbox', value: false, group: 'payments', label: 'Zarinpal sandbox', description: 'برای پرداخت واقعی باید غیرفعال باشد.', type: 'boolean', isPublic: false },
  { key: 'zibal_enabled', value: false, group: 'payments', label: 'Zibal enabled', type: 'boolean', isPublic: false },
  { key: 'zibal_merchant', value: '', group: 'payments', label: 'Zibal merchant', type: 'password', isPublic: false },
  { key: 'idpay_enabled', value: false, group: 'payments', label: 'IDPay enabled', type: 'boolean', isPublic: false },
  { key: 'idpay_api_key', value: '', group: 'payments', label: 'IDPay API key', type: 'password', isPublic: false },
  { key: 'payir_enabled', value: false, group: 'payments', label: 'Pay.ir enabled', type: 'boolean', isPublic: false },
  { key: 'payir_api_key', value: '', group: 'payments', label: 'Pay.ir API key', type: 'password', isPublic: false },
  { key: 'market_data_enabled', value: true, group: 'market_data', label: 'Market data sync enabled', type: 'boolean', isPublic: false },
  { key: 'market_data_refresh_seconds', value: '300', group: 'market_data', label: 'Refresh interval seconds', type: 'number', isPublic: false },
  { key: 'market_data_default_free_provider', value: 'alpha_vantage', group: 'market_data_free', label: 'Default free market data provider', description: 'Supported values: alpha_vantage, finnhub, twelve_data, polygon, coingecko, frankfurter, metals_api.', type: 'text', isPublic: false },
  { key: 'market_data_provider_priority', value: 'alpha_vantage,finnhub,twelve_data,polygon,coingecko,frankfurter,metals_api', group: 'market_data_free', label: 'Provider priority order', description: 'Comma-separated fallback order for real market data providers.', type: 'text', isPublic: false },
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
  { key: 'coingecko_enabled', value: false, group: 'market_data_free', label: 'CoinGecko API enabled', description: 'CoinGecko market data API for crypto prices. Docs: https://docs.coingecko.com/', type: 'boolean', isPublic: false },
  { key: 'coingecko_base_url', value: 'https://api.coingecko.com/api/v3', group: 'market_data_free', label: 'CoinGecko base URL', type: 'text', isPublic: false },
  { key: 'coingecko_api_key', value: '', group: 'market_data_free', label: 'CoinGecko API key', description: 'Configure when your CoinGecko plan requires authenticated calls.', type: 'password', isPublic: false },
  { key: 'coingecko_docs_url', value: 'https://docs.coingecko.com/', group: 'market_data_free', label: 'CoinGecko docs URL', type: 'text', isPublic: false },
  { key: 'frankfurter_enabled', value: false, group: 'market_data_free', label: 'Frankfurter enabled', description: 'Free, no-key exchange-rate API for 205 currencies from central-bank sources. Not intended for live trading. Docs: https://frankfurter.dev/', type: 'boolean', isPublic: false },
  { key: 'frankfurter_base_url', value: 'https://api.frankfurter.dev/v2', group: 'market_data_free', label: 'Frankfurter base URL', type: 'text', isPublic: false },
  { key: 'frankfurter_api_key', value: '', group: 'market_data_free', label: 'Frankfurter API key', description: 'Not required for the public Frankfurter API; keep empty unless using a private/self-hosted instance.', type: 'password', isPublic: false },
  { key: 'frankfurter_docs_url', value: 'https://frankfurter.dev/', group: 'market_data_free', label: 'Frankfurter docs URL', type: 'text', isPublic: false },
  { key: 'metals_api_enabled', value: false, group: 'market_data_free', label: 'Metals-API enabled', description: 'Precious metals price API for gold, silver, palladium, and platinum. Free tier requires an API key. Docs: https://metals-api.com/documentation', type: 'boolean', isPublic: false },
  { key: 'metals_api_base_url', value: 'https://metals-api.com/api', group: 'market_data_free', label: 'Metals-API base URL', type: 'text', isPublic: false },
  { key: 'metals_api_api_key', value: '', group: 'market_data_free', label: 'Metals-API API key', description: 'Required access key from Metals-API.', type: 'password', isPublic: false },
  { key: 'metals_api_docs_url', value: 'https://metals-api.com/documentation', group: 'market_data_free', label: 'Metals-API docs URL', type: 'text', isPublic: false },
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
  { key: 'hero_banner_url', value: '', group: 'content', label: 'Hero banner URL', description: 'آدرس تصویر بنر صفحه اصلی را وارد کنید. برای فایل‌های داخل public از مسیرهایی مثل /images/hero-banner.png استفاده کنید.', type: 'url', isPublic: true },
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

    await prisma.siteSetting.updateMany({
      where: { key: 'otp_sms_provider', type: { not: 'select' } },
      data: { type: 'select', label: 'SMS provider', description: 'سرویس ارسال پیامک کد یکبار مصرف. برای production یکی از سرویس‌های واقعی را همراه با کلید API تنظیم کنید.' },
    });

    await prisma.siteSetting.updateMany({
      where: { key: 'otp_dev_show_code', value: { equals: true } },
      data: { value: false, label: 'Show OTP code in development', description: 'این گزینه فقط برای محیط توسعه است و در production باید غیرفعال بماند.' },
    });

    await prisma.siteSetting.updateMany({
      where: { key: 'otp_sms_provider', value: { equals: 'manual' } },
      data: { value: 'kavenegar', type: 'select', label: 'SMS provider', description: 'سرویس ارسال پیامک کد یکبار مصرف. برای production یکی از سرویس‌های واقعی را همراه با کلید API تنظیم کنید.' },
    });

    await prisma.siteSetting.updateMany({
      where: { key: 'zarinpal_sandbox', value: { equals: true } },
      data: { value: false, label: 'Zarinpal sandbox', description: 'برای پرداخت واقعی باید غیرفعال باشد.' },
    });

    await prisma.siteSetting.updateMany({
      where: { key: 'coingecko_enabled' },
      data: { label: 'CoinGecko API enabled', description: 'CoinGecko market data API for crypto prices. Docs: https://docs.coingecko.com/' },
    });

    await prisma.siteSetting.updateMany({
      where: { key: 'coingecko_api_key' },
      data: { description: 'Configure when your CoinGecko plan requires authenticated calls.' },
    });

    await prisma.siteSetting.updateMany({
      where: { key: 'market_data_default_free_provider' },
      data: { description: 'Supported values: alpha_vantage, finnhub, twelve_data, polygon, coingecko, frankfurter, metals_api.' },
    });

    await prisma.siteSetting.updateMany({
      where: {
        key: 'market_data_provider_priority',
        value: { equals: 'alpha_vantage,finnhub,twelve_data,polygon,coingecko' },
      },
      data: { value: 'alpha_vantage,finnhub,twelve_data,polygon,coingecko,frankfurter,metals_api' },
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

  static async getSettingsMap(publicOnly = false) {
    const settings = await this.getSettings(publicOnly);
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
