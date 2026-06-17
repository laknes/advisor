import { PrismaClient } from '@prisma/client';
import bcryptjs from 'bcryptjs';

const prisma = new PrismaClient();

const adminEmail = process.env.INSTALL_ADMIN_EMAIL || process.env.ADMIN_EMAIL;
const adminPassword = process.env.INSTALL_ADMIN_PASSWORD;
const adminName = process.env.INSTALL_ADMIN_NAME || 'مدیر سیستم';

if (!adminEmail) {
  throw new Error('INSTALL_ADMIN_EMAIL or ADMIN_EMAIL is required');
}

if (!adminPassword || adminPassword.length < 8) {
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
    name: 'تحلیل روزانه',
    slug: 'daily-analysis',
    description: 'تحلیل روزانه بازار برای معامله‌گران کوتاه‌مدت',
    type: 'timeframe',
    price: 4900000,
    currency: 'IRR',
    billingPeriod: 'monthly',
    features: ['تحلیل روزانه', 'دسترسی به یک بازار', 'هشدارهای پایه', 'اعلان ایمیلی'],
  },
  {
    name: 'تحلیل هفتگی',
    slug: 'weekly-analysis',
    description: 'تحلیل عمیق هفتگی برای معامله‌گران نوسانی',
    type: 'timeframe',
    price: 9900000,
    currency: 'IRR',
    billingPeriod: 'monthly',
    features: ['تحلیل هفتگی', 'تمام تایم‌فریم‌های کوتاه‌مدت', 'هشدارهای پیشرفته', 'پشتیبانی اولویت‌دار'],
  },
  {
    name: 'تحلیل ماهانه',
    slug: 'monthly-analysis',
    description: 'تحلیل استراتژیک ماهانه برای سرمایه‌گذاران فعال',
    type: 'timeframe',
    price: 14900000,
    currency: 'IRR',
    billingPeriod: 'monthly',
    features: ['تحلیل ماهانه', 'گزارش‌های دقیق', 'راهنمایی پورتفو', 'مشاور اختصاصی'],
  },
  {
    name: 'دسترسی همه بازارها',
    slug: 'all-markets',
    description: 'دسترسی پریمیوم به همه بازارهای فعال پلتفرم',
    type: 'all_markets',
    price: 69900000,
    currency: 'IRR',
    billingPeriod: 'monthly',
    features: ['دسترسی کامل همه بازارها', 'تمام انواع تحلیل', 'هشدار چنددارایی', 'پشتیبانی اولویت‌دار'],
  },
  {
    name: 'VIP الیت',
    slug: 'vip-elite',
    description: 'تجربه کامل مشاوره اختصاصی سرمایه‌گذاری',
    type: 'vip',
    price: 129900000,
    currency: 'IRR',
    billingPeriod: 'monthly',
    features: ['مشاور شخصی تمام‌وقت', 'سیگنال‌های اختصاصی سرمایه‌گذاری', 'وبینارهای خصوصی بازار'],
  },
];

async function main() {
  const password = await bcryptjs.hash(adminPassword, 10);

  const admin = await prisma.user.upsert({
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

  console.log(`Production seed complete. Admin user: ${admin.email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
