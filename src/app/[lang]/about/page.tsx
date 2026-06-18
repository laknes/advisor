'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  BarChart3,
  BellRing,
  CheckCircle2,
  FileText,
  Globe2,
  LineChart,
  LockKeyhole,
  Radar,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
  WalletCards,
} from 'lucide-react';

import { Header, Footer, Button, Card } from '@/components';
import { useLocale } from '@/components/LocaleProvider';

const fadeInUp = {
  initial: { opacity: 0, y: 22 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.55, ease: 'easeOut' },
};

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const stats = [
  { label: 'بازار تحت پوشش', value: '۴+', detail: 'بورس، طلا، ارز و فارکس' },
  { label: 'نوع تحلیل', value: '۳', detail: 'کوتاه‌مدت، بلندمدت و ویژه' },
  { label: 'تمرکز اصلی', value: 'ریسک', detail: 'تصمیم‌گیری بدون هیجان' },
];

const values = [
  {
    icon: ShieldCheck,
    title: 'شفافیت در تحلیل',
    text: 'هر تحلیل با سناریو، محدوده ورود، هدف، حد ریسک و منطق تصمیم منتشر می‌شود تا کاربر بداند پشت هر پیشنهاد چه فرضیاتی وجود دارد.',
  },
  {
    icon: Target,
    title: 'تمرکز روی تصمیم قابل اجرا',
    text: 'هدف ما تولید متن‌های طولانی و مبهم نیست؛ خروجی باید به تصمیم عملی، اولویت‌بندی بازار و مدیریت سرمایه کمک کند.',
  },
  {
    icon: LockKeyhole,
    title: 'حفظ استقلال کاربر',
    text: 'مشاور پورتفو ابزار تصمیم‌سازی است، نه وعده سود قطعی. ما ریسک‌ها را روشن می‌کنیم تا انتخاب نهایی آگاهانه‌تر باشد.',
  },
];

const process = [
  {
    icon: Radar,
    title: 'رصد داده‌های بازار',
    text: 'قیمت، روند، حجم، رویدادهای اثرگذار و رفتار بین‌بازاری به‌صورت پیوسته پایش می‌شود.',
  },
  {
    icon: BarChart3,
    title: 'تحلیل تکنیکال و بنیادی',
    text: 'سناریوها با ترکیبی از ساختار قیمت، سطوح کلیدی، وضعیت اقتصاد کلان و جریان نقدینگی بررسی می‌شوند.',
  },
  {
    icon: FileText,
    title: 'تبدیل به گزارش کاربردی',
    text: 'نتیجه تحلیل در قالب گزارش قابل خواندن، سیگنال، هشدار و پیشنهاد مدیریت ریسک در اختیار کاربر قرار می‌گیرد.',
  },
  {
    icon: BellRing,
    title: 'پیگیری و به‌روزرسانی',
    text: 'با تغییر شرایط بازار، تحلیل‌ها و هشدارها به‌روزرسانی می‌شوند تا تصمیم‌ها روی داده قدیمی نمانند.',
  },
];

const markets = [
  { icon: LineChart, title: 'بورس ایران', text: 'رصد شاخص کل، صنایع اثرگذار و نمادهای مهم بازار سرمایه.' },
  { icon: Globe2, title: 'فارکس', text: 'تحلیل جفت‌ارزهای اصلی، روند دلار جهانی و نقاط حساس معاملاتی.' },
  { icon: Sparkles, title: 'طلا و فلزات', text: 'بررسی اونس جهانی، طلا، سطوح حمایتی و سناریوهای ریسک‌گریز.' },
  { icon: WalletCards, title: 'ارز و کریپتو', text: 'پیگیری ارزهای مهم، جریان نقدینگی و فرصت‌های چنددارایی.' },
];

const trustItems = [
  'بیان شفاف ریسک و عدم ارائه وعده سود قطعی',
  'تفکیک تحلیل رایگان، اشتراکی و ویژه',
  'پایش چندبازاری برای کاهش تصمیم‌های تک‌بعدی',
  'تمرکز روی مدیریت سرمایه، نه فقط نقطه ورود',
  'طراحی فارسی و قابل استفاده برای سرمایه‌گذار ایرانی',
  'اتصال تحلیل‌ها به داشبورد، واچ‌لیست و هشدارها',
];

export default function AboutPage() {
  const { locale } = useLocale();

  return (
    <div className="min-h-screen overflow-hidden bg-[#160022] text-white">
      <Header isAuthenticated={false} />

      <main>
        <section className="relative overflow-hidden border-b border-white/10 py-16 md:py-24">
          <div className="aurora-grid absolute inset-0 opacity-45" />
          <div className="absolute inset-x-0 top-0 h-80 bg-[radial-gradient(circle_at_top,#8b5cf655,transparent_60%)]" />

          <div className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 sm:px-6 lg:grid-cols-[1.02fr_0.98fr] lg:px-8">
            <motion.div initial="initial" animate="animate" variants={stagger} className="space-y-8 lg:order-2">
              <motion.h1 variants={fadeInUp} className="max-w-4xl text-4xl font-black leading-tight md:text-6xl">
                درباره مشاور پورتفو
                <span className="block text-primary-100">تحلیل بازار، تبدیل‌شده به تصمیم قابل اجرا</span>
              </motion.h1>
              <motion.p variants={fadeInUp} className="max-w-3xl text-lg leading-9 text-slate-300">
                مشاور پورتفو برای سرمایه‌گذارانی ساخته شده که می‌خواهند بین داده‌های پراکنده بازار، گزارش‌های طولانی و هیجان لحظه‌ای، یک مسیر روشن‌تر برای تصمیم‌گیری داشته باشند. ما تحلیل، مدیریت ریسک و ابزارهای پیگیری بازار را در یک تجربه فارسی و منظم کنار هم قرار می‌دهیم.
              </motion.p>
              <motion.div variants={fadeInUp} className="flex flex-col gap-4 sm:flex-row">
                <Link href={`/${locale}/pricing`}>
                  <Button size="lg" className="h-14 w-full px-8 sm:w-auto" rightIcon={<ArrowLeft className="h-5 w-5" />}>
                    مشاهده پلن‌ها
                  </Button>
                </Link>
                <Link href={`/${locale}/markets`}>
                  <Button variant="outline" size="lg" className="h-14 w-full px-8 sm:w-auto">
                    بازارهای تحت پوشش
                  </Button>
                </Link>
              </motion.div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: -36 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }} className="lg:order-1">
              <Card className="relative border-white/10 bg-white/[0.08] p-5 shadow-2xl md:p-7">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-black text-primary-100">نمای تصمیم‌سازی</p>
                    <h2 className="mt-2 text-2xl font-black">از داده تا اقدام</h2>
                  </div>
                  <div className="rounded-lg bg-primary-100/15 p-3 text-primary-100">
                    <LineChart className="h-7 w-7" />
                  </div>
                </div>

                <div className="space-y-4">
                  {[
                    { label: 'روند بازار', value: 'صعودی محتاطانه', width: '78%' },
                    { label: 'سطح ریسک', value: 'متوسط', width: '54%' },
                    { label: 'قدرت سناریو', value: 'بالا', width: '86%' },
                  ].map((item) => (
                    <div key={item.label} className="rounded-lg border border-white/10 bg-black/20 p-4">
                      <div className="mb-3 flex items-center justify-between gap-4">
                        <span className="text-sm font-bold text-slate-300">{item.label}</span>
                        <span className="font-black text-white">{item.value}</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-white/10">
                        <motion.div initial={{ width: 0 }} animate={{ width: item.width }} transition={{ duration: 1.1, delay: 0.2 }} className="h-full rounded-full bg-gradient-to-l from-white to-primary-200" />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-5 grid grid-cols-3 gap-3">
                  {stats.map((stat) => (
                    <div key={stat.label} className="rounded-lg border border-white/10 bg-white/[0.06] p-3">
                      <p className="text-2xl font-black text-primary-100">{stat.value}</p>
                      <p className="mt-1 text-xs font-black text-white">{stat.label}</p>
                      <p className="mt-2 text-[11px] leading-5 text-slate-400">{stat.detail}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
              <SectionIntro
                title="ماموریت ما"
                subtitle="کمک به تصمیم‌گیری آگاهانه در بازارهای پرنوسان"
                text="ما باور داریم سرمایه‌گذاری خوب فقط پیدا کردن یک سیگنال نیست؛ ترکیبی از فهم روند، شناخت ریسک، زمان‌بندی مناسب و پایبندی به برنامه است. مشاور پورتفو تلاش می‌کند این اجزا را ساده، شفاف و قابل پیگیری کند."
              />
              <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                {values.map((item) => (
                  <InfoCard key={item.title} {...item} />
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-white/10 bg-white/[0.04] py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionTitle title="روش کار ما" subtitle="هر گزارش از یک مسیر مشخص عبور می‌کند تا خروجی آن فقط یک نظر کلی نباشد." />
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
              {process.map((item, index) => (
                <ProcessCard key={item.title} index={index + 1} {...item} />
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionTitle title="بازارهایی که پوشش می‌دهیم" subtitle="پلتفرم برای نگاه چندبازاری طراحی شده، چون ریسک و فرصت معمولاً فقط در یک نمودار دیده نمی‌شود." />
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
              {markets.map((item) => (
                <InfoCard key={item.title} {...item} />
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 sm:px-6 lg:grid-cols-[1fr_1fr] lg:px-8">
            <Card className="border-white/10 bg-white/[0.08] p-6 md:p-8">
              <Users className="mb-6 h-9 w-9 text-primary-100" />
              <h2 className="text-3xl font-black leading-tight md:text-4xl">برای چه کسانی ساخته شده‌ایم؟</h2>
              <p className="mt-5 text-base leading-8 text-slate-300">
                این پلتفرم برای معامله‌گران فعال، سرمایه‌گذاران بلندمدت، مدیران پورتفو و کاربرانی طراحی شده که می‌خواهند تصمیم‌های مالی خود را با نظم، داده و تحلیل حرفه‌ای‌تر دنبال کنند.
              </p>
              <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {['معامله‌گر کوتاه‌مدت', 'سرمایه‌گذار بلندمدت', 'کاربر علاقه‌مند به تحلیل', 'مدیر پورتفوی شخصی'].map((item) => (
                  <div key={item} className="rounded-lg border border-white/10 bg-black/20 px-4 py-3 text-sm font-black text-slate-200">
                    {item}
                  </div>
                ))}
              </div>
            </Card>

            <Card className="border-primary-100/30 bg-white text-secondary-950 p-6 md:p-8">
              <ShieldCheck className="mb-6 h-9 w-9 text-primary-700" />
              <h2 className="text-3xl font-black leading-tight md:text-4xl">چرا به ما اعتماد می‌کنید؟</h2>
              <div className="mt-7 space-y-4">
                {trustItems.map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-primary-700" />
                    <p className="text-sm font-bold leading-7 text-secondary-800">{item}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </section>

        <section className="relative overflow-hidden py-20 md:py-28">
          <div className="absolute inset-x-6 inset-y-0 rounded-lg bg-gradient-to-l from-white/20 via-white/10 to-primary-200/20 blur-2xl" />
          <div className="relative z-10 mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="text-4xl font-black leading-tight md:text-6xl">آماده‌اید بازار را شفاف‌تر ببینید؟</h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-9 text-slate-300">
              از صفحه بازارها شروع کنید، پلن مناسب خود را انتخاب کنید و تحلیل‌هایی را دنبال کنید که به تصمیم‌های قابل اجرا نزدیک‌ترند.
            </p>
            <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
              <Link href={`/${locale}/markets`}>
                <Button size="lg" className="h-14 px-10" rightIcon={<ArrowLeft className="h-5 w-5" />}>
                  شروع از بازارها
                </Button>
              </Link>
              <Link href={`/${locale}/faq`}>
                <Button size="lg" variant="outline" className="h-14 px-10">
                  سوالات متداول
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

function SectionTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-12 text-center">
      <h2 className="text-3xl font-black leading-tight md:text-5xl">{title}</h2>
      <p className="mx-auto mt-4 max-w-3xl text-base leading-8 text-slate-300 md:text-lg">{subtitle}</p>
    </motion.div>
  );
}

function SectionIntro({ title, subtitle, text }: { title: string; subtitle: string; text: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
      <p className="mb-3 text-sm font-black text-primary-100">{title}</p>
      <h2 className="text-3xl font-black leading-tight md:text-5xl">{subtitle}</h2>
      <p className="mt-5 text-base leading-9 text-slate-300 md:text-lg">{text}</p>
    </motion.div>
  );
}

function InfoCard({ icon: Icon, title, text }: { icon: React.ElementType; title: string; text: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
      <Card className="h-full border-white/10 bg-white/[0.07] p-5">
        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100/15 text-primary-100">
          <Icon className="h-6 w-6" />
        </div>
        <h3 className="text-xl font-black text-white">{title}</h3>
        <p className="mt-4 text-sm leading-7 text-slate-300">{text}</p>
      </Card>
    </motion.div>
  );
}

function ProcessCard({ icon: Icon, title, text, index }: { icon: React.ElementType; title: string; text: string; index: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
      <Card className="relative h-full border-white/10 bg-white/[0.07] p-5">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white text-primary-900">
            <Icon className="h-6 w-6" />
          </div>
          <span className="font-mono text-3xl font-black text-white/20">{String(index).padStart(2, '0')}</span>
        </div>
        <h3 className="text-xl font-black text-white">{title}</h3>
        <p className="mt-4 text-sm leading-7 text-slate-300">{text}</p>
      </Card>
    </motion.div>
  );
}
