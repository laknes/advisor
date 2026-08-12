import { PrismaClient } from '@prisma/client';
import bcryptjs from 'bcryptjs';

const prisma = new PrismaClient();

const adminEmail = process.env.INSTALL_ADMIN_EMAIL || process.env.ADMIN_EMAIL;
const adminPassword = process.env.INSTALL_ADMIN_PASSWORD;
const adminName = process.env.INSTALL_ADMIN_NAME || 'مدیر سیستم';
const skipAdminSeed = process.env.INSTALL_SKIP_ADMIN_SEED === 'true';

if (!skipAdminSeed && !adminEmail) {
  throw new Error('INSTALL_ADMIN_EMAIL or ADMIN_EMAIL is required');
}

if (!skipAdminSeed && (!adminPassword || adminPassword.length < 8)) {
  throw new Error('INSTALL_ADMIN_PASSWORD with at least 8 characters is required');
}

const markets = [
  {
    name: 'بورس ایران',
    slug: 'iran-stocks',
    symbol: 'شاخص کل',
    icon: '📊',
    description: 'رصد بورس تهران، صنایع پیشرو و نمادهای اثرگذار بازار سهام ایران',
  },
  {
    name: 'فارکس',
    slug: 'forex',
    symbol: 'جفت‌ارزها',
    icon: '💱',
    description: 'تحلیل جفت‌ارزهای اصلی، روند دلار جهانی و فرصت‌های کوتاه‌مدت',
  },
  {
    name: 'طلا',
    slug: 'gold',
    symbol: 'اونس جهانی',
    icon: '🏆',
    description: 'ردیابی قیمت نقدی طلا، فلزات گران‌بها و سطوح کلیدی بازار',
  },
  {
    name: 'ارز',
    slug: 'currency',
    symbol: 'دلار/ریال',
    icon: '💵',
    description: 'پیگیری دلار، یورو و سبد ارزهای مهم در برابر ریال ایران',
  },
];

const plans = [
  {
    name: 'Basic',
    slug: 'basic',
    description: 'شروع دسترسی به بازارهای منتخب با تعداد تحلیل محدود',
    type: 'timeframe',
    tier: 'basic',
    price: 4900000,
    currency: 'IRR',
    billingPeriod: 'monthly',
    features: ['دسترسی پایه به بازارها', 'تحلیل‌های منتخب', 'هشدارهای پایه', 'اعلان ایمیلی'],
    accessRules: [],
  },
  {
    name: 'Plus',
    slug: 'plus',
    description: 'پوشش بازار و تعداد تحلیل بیشتر برای سرمایه‌گذاران فعال',
    type: 'market_full',
    tier: 'plus',
    price: 9900000,
    currency: 'IRR',
    billingPeriod: 'monthly',
    features: ['بازارهای بیشتر', 'تحلیل‌های بیشتر برای هر بازار', 'هشدارهای پیشرفته', 'پشتیبانی اولویت‌دار'],
    accessRules: [],
  },
  {
    name: 'Pro',
    slug: 'pro',
    description: 'بیشترین سطح دسترسی به بازارها و تحلیل‌های حرفه‌ای',
    type: 'all_markets',
    tier: 'pro',
    price: 14900000,
    currency: 'IRR',
    billingPeriod: 'monthly',
    features: ['دسترسی گسترده بازارها', 'بالاترین تعداد تحلیل', 'گزارش‌های دقیق', 'مشاور اختصاصی'],
    accessRules: [],
  },
  {
    name: 'دسترسی همه بازارها',
    slug: 'all-markets',
    description: 'دسترسی پریمیوم به همه بازارهای فعال پلتفرم',
    type: 'all_markets',
    tier: 'pro',
    price: 69900000,
    currency: 'IRR',
    billingPeriod: 'monthly',
    features: ['دسترسی کامل همه بازارها', 'تمام انواع تحلیل', 'هشدار چنددارایی', 'پشتیبانی اولویت‌دار'],
    accessRules: [],
  },
  {
    name: 'VIP الیت',
    slug: 'vip-elite',
    description: 'تجربه کامل مشاوره اختصاصی سرمایه‌گذاری',
    type: 'vip',
    tier: 'pro',
    price: 129900000,
    currency: 'IRR',
    billingPeriod: 'monthly',
    features: ['مشاور شخصی تمام‌وقت', 'سیگنال‌های اختصاصی سرمایه‌گذاری', 'وبینارهای خصوصی بازار'],
    accessRules: [],
  },
];

const siteSettings = [
  { key: 'contact_menu_enabled', value: true, group: 'contact', label: 'Contact menu enabled', description: 'نمایش یا عدم نمایش منوی تماس با ما در هدر سایت.', type: 'boolean', isPublic: true },
  { key: 'support_email', value: 'support@example.com', group: 'contact', label: 'Support email', description: null, type: 'email', isPublic: true },
  { key: 'support_phone', value: '', group: 'contact', label: 'Support phone', description: null, type: 'text', isPublic: true },
  { key: 'online_chat_url', value: '', group: 'contact', label: 'Online chat URL', description: 'لینک چت آنلاین، واتساپ، Crisp، Tawk یا هر سرویس چت دیگر.', type: 'url', isPublic: true },
  { key: 'online_chat_label', value: 'چت آنلاین', group: 'contact', label: 'Online chat label', description: null, type: 'text', isPublic: true },
  { key: 'support_ticket_enabled', value: true, group: 'contact', label: 'Ticket submission enabled', description: null, type: 'boolean', isPublic: true },
  { key: 'telegram_url', value: '', group: 'contact', label: 'Telegram URL', description: null, type: 'url', isPublic: true },
  { key: 'instagram_url', value: '', group: 'contact', label: 'Instagram URL', description: null, type: 'url', isPublic: true },
  { key: 'whatsapp_url', value: '', group: 'contact', label: 'WhatsApp URL', description: null, type: 'url', isPublic: true },
  { key: 'linkedin_url', value: '', group: 'contact', label: 'LinkedIn URL', description: null, type: 'url', isPublic: true },
  { key: 'contact_note', value: 'برای دریافت سریع‌ترین پاسخ، تیکت ثبت کنید یا از چت آنلاین استفاده کنید.', group: 'contact', label: 'Contact menu note', description: null, type: 'textarea', isPublic: true },
  { key: 'otp_enabled', value: true, group: 'otp', label: 'OTP login enabled', description: 'فعال بودن ورود و تایید شماره موبایل با کد یکبار مصرف.', type: 'boolean', isPublic: true },
  { key: 'otp_code_length', value: 6, group: 'otp', label: 'OTP code length', description: 'تعداد ارقام کد یکبار مصرف.', type: 'number', isPublic: false },
  { key: 'otp_ttl_minutes', value: 5, group: 'otp', label: 'OTP expiry minutes', description: 'مدت اعتبار کد یکبار مصرف به دقیقه.', type: 'number', isPublic: false },
  { key: 'otp_resend_seconds', value: 60, group: 'otp', label: 'OTP resend delay seconds', description: 'حداقل فاصله بین دو درخواست کد برای یک شماره.', type: 'number', isPublic: false },
  { key: 'otp_max_attempts', value: 5, group: 'otp', label: 'OTP max attempts', description: 'حداکثر دفعات تلاش برای وارد کردن هر کد.', type: 'number', isPublic: false },
  { key: 'otp_dev_show_code', value: true, group: 'otp', label: 'Show OTP code in development', description: 'برای تست بدون سرویس پیامک، کد را در پاسخ API و لاگ سرور نشان می‌دهد.', type: 'boolean', isPublic: false },
  { key: 'otp_sms_provider', value: 'manual', group: 'otp', label: 'SMS provider', description: 'نام سرویس پیامک. فعلا حالت manual برای تست و اتصال بعدی استفاده می‌شود.', type: 'text', isPublic: false },
  { key: 'otp_sms_api_key', value: '', group: 'otp', label: 'SMS API key', description: null, type: 'password', isPublic: false },
  { key: 'otp_sms_sender', value: '', group: 'otp', label: 'SMS sender number', description: null, type: 'text', isPublic: false },
];

async function main() {
  let admin = null;

  if (!skipAdminSeed) {
    const password = await bcryptjs.hash(adminPassword, 10);

    admin = await prisma.user.upsert({
      where: { email: adminEmail },
      update: {
        password,
        name: adminName,
        verified: true,
      },
      create: {
        email: adminEmail,
        password,
        name: adminName,
        verified: true,
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });
  }

  await Promise.all(
    markets.map((market) =>
      prisma.market.upsert({
        where: { slug: market.slug },
        update: market,
        create: market,
      }),
    ),
  );

  await Promise.all(
    plans.map((plan) =>
      prisma.subscriptionPlan.upsert({
        where: { slug: plan.slug },
        update: { ...plan, isActive: true },
        create: { ...plan, isActive: true },
      }),
    ),
  );

  await Promise.all(
    siteSettings.map((setting) =>
      prisma.siteSetting.upsert({
        where: { key: setting.key },
        update: {
          group: setting.group,
          label: setting.label,
          description: setting.description,
          type: setting.type,
          isPublic: setting.isPublic,
        },
        create: setting,
      }),
    ),
  );

  console.log(`Production seed complete.${admin ? ` Admin user: ${admin.email}` : ' Admin seed skipped.'}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
