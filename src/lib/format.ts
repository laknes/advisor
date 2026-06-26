const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

const faUiPhrases: Array<[RegExp, string]> = [
  [/Portfolio Advisor/g, 'سرمایه گذاری موسوی'],
  [/Main Markets/g, 'بازارهای اصلی'],
  [/Market Watch/g, 'دیدبان بازار'],
  [/Choose Your Plan/g, 'پلن مناسب خود را انتخاب کنید'],
  [/Subscribe Now/g, 'شروع اشتراک'],
  [/Subscribed/g, 'مشترک شده'],
  [/View All Plans/g, 'مشاهده همه پلن‌ها'],
  [/View Analysis/g, 'مشاهده تحلیل'],
  [/Unlock Analysis/g, 'باز کردن تحلیل'],
  [/Unlock Now/g, 'باز کردن دسترسی'],
  [/Read Full/g, 'مطالعه کامل'],
  [/Sign Up Now/g, 'ثبت‌نام رایگان'],
  [/Learn More/g, 'اطلاعات بیشتر'],
  [/Create Account/g, 'ایجاد حساب'],
  [/Login to your/g, 'ورود به'],
  [/Account Management/g, 'مدیریت حساب'],
  [/Delete Account/g, 'حذف حساب'],
  [/Account/g, 'حساب کاربری'],
  [/All Markets/g, 'همه بازارها'],
  [/Iran Stocks/g, 'بورس ایران'],
  [/Forex/g, 'فارکس'],
  [/Gold & Metals/g, 'طلا و فلزات'],
  [/Currencies/g, 'ارزها'],
  [/Global Market/g, 'بازار جهانی'],
  [/Asset \/ Symbol/g, 'دارایی / نماد'],
  [/Last Price/g, 'آخرین قیمت'],
  [/Net Change/g, 'تغییر خالص'],
  [/% Change/g, 'درصد تغییر'],
  [/Day Range/g, 'بازه روز'],
  [/Entry Price/g, 'قیمت ورود'],
  [/Target Price/g, 'قیمت هدف'],
  [/Entry/g, 'ورود'],
  [/Target/g, 'هدف'],
  [/Accuracy/g, 'دقت'],
  [/Signal/g, 'سیگنال'],
  [/WATCH/g, 'زیر نظر'],
  [/BUY/g, 'خرید'],
  [/SELL/g, 'فروش'],
  [/HOLD/g, 'نگهداری'],
  [/POPULAR/g, 'محبوب'],
  [/Daily Analysis/g, 'تحلیل روزانه'],
  [/Weekly Analysis/g, 'تحلیل هفتگی'],
  [/Monthly Analysis/g, 'تحلیل ماهانه'],
  [/Start Your Investment Journey Today/g, 'سفر سرمایه‌گذاری خود را از امروز شروع کنید'],
  [/Start Your Premium Investment Experience/g, 'تجربه سرمایه‌گذاری حرفه‌ای خود را شروع کنید'],
  [/Join thousands of investors/g, 'به هزاران سرمایه‌گذار بپیوندید'],
  [/Data is updated in real-time/g, 'داده‌ها به‌صورت لحظه‌ای به‌روزرسانی می‌شوند'],
  [/Tehran Stock Exchange/g, 'بورس تهران'],
  [/Gold Spot/g, 'طلای جهانی'],
  [/Currency Markets/g, 'بازار ارز'],
  [/Email notifications/g, 'اعلان ایمیلی'],
  [/Priority support/g, 'پشتیبانی اولویت‌دار'],
  [/Select Market/g, 'انتخاب بازار'],
  [/Gold Bullish Continuation Patterns/g, 'الگوی ادامه صعودی طلا'],
  [/Brief overview of the analysis \(shown in previews\)/g, 'خلاصه کوتاه تحلیل برای نمایش در پیش‌نمایش'],
  [/Detailed technical and fundamental analysis\.\.\./g, 'تحلیل کامل تکنیکال و بنیادی...'],
];

export function translateFaUiText(value: string) {
  return faUiPhrases.reduce((text, [pattern, replacement]) => text.replace(pattern, replacement), value);
}

export function toPersianDigits(value: string | number) {
  return String(value).replace(/\d/g, (digit) => persianDigits[Number(digit)]);
}

export function formatFaNumber(
  value: number,
  options?: Intl.NumberFormatOptions,
) {
  return new Intl.NumberFormat('fa-IR', options).format(value);
}

export function formatFaDate(value: Date | string | number) {
  return new Intl.DateTimeFormat('fa-IR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(value));
}
