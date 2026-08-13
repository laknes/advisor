'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Header, Footer, Card, Button, useLocale } from '@/components';
import { apiPost } from '@/lib/apiClient';
import { getStoredUser } from '@/lib/clientAuth';
import { CheckCircle2, LifeBuoy, Mail, MessageCircle, Phone, Send, Share2, Ticket } from 'lucide-react';
import { getBrandName, usePublicSettings } from '@/components/usePublicSettings';

type TicketForm = {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
};

type ContactChannel = {
  href: string;
  label: string;
  detail: string;
  external?: boolean;
  icon: React.ReactNode;
};

const emptyForm: TicketForm = {
  name: '',
  email: '',
  phone: '',
  subject: '',
  message: '',
};

function settingString(settings: Record<string, unknown>, key: string) {
  return String(settings[key] || '').trim();
}

function hasPersianText(value: string) {
  return /[\u0600-\u06FF]/.test(value);
}

export default function ContactPage() {
  const { locale } = useLocale();
  const settings = usePublicSettings();
  const brandName = getBrandName(settings, locale);
  const [form, setForm] = useState<TicketForm>(emptyForm);
  const [status, setStatus] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const ticketEnabled = settings.support_ticket_enabled !== false;

  const contactChannels = useMemo(() => getContactChannels(settings, locale), [settings, locale]);

  useEffect(() => {
    const user = getStoredUser();
    if (!user) return;
    setForm((current) => ({
      ...current,
      name: current.name || user.name || '',
      email: current.email || user.email || '',
    }));
  }, []);

  const updateForm = <K extends keyof TicketForm>(key: K, value: TicketForm[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const submitTicket = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus('');
    setIsSaving(true);

    try {
      await apiPost('/api/support/tickets', {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        subject: form.subject.trim(),
        message: form.message.trim(),
      });
      setForm(emptyForm);
      setStatus(locale === 'fa' ? 'تیکت شما ثبت شد. تیم پشتیبانی از همین مسیر پیگیری می‌کند.' : 'Your ticket was submitted successfully.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : locale === 'fa' ? 'ثبت تیکت ناموفق بود.' : 'Failed to submit ticket.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#160022] text-white">
      <Header />

      <main className="relative overflow-hidden py-12 md:py-18">
        <div className="aurora-grid absolute inset-0 opacity-35" />
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <section className="mb-8 max-w-3xl">
            <div className="mb-5 inline-flex rounded-lg border border-white/10 bg-white/[0.07] p-3 text-primary-100">
              <LifeBuoy className="h-7 w-7" />
            </div>
            <h1 className="text-4xl font-black leading-tight md:text-6xl">
              {locale === 'fa' ? 'تماس با ما' : 'Contact us'}
            </h1>
            <p className="mt-5 text-base leading-8 text-slate-300 md:text-lg">
              {locale === 'fa'
                ? `برای ارتباط با ${brandName}، از راه‌های ارتباطی زیر استفاده کنید یا درخواست خود را به شکل تیکت ثبت کنید.`
                : `Reach ${brandName} through the channels below or submit your request as a support ticket.`}
            </p>
          </section>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <section className="space-y-4">
              <div>
                <h2 className="text-2xl font-black text-white">{locale === 'fa' ? 'راه‌های ارتباطی' : 'Contact channels'}</h2>
                <p className="mt-2 text-sm leading-7 text-slate-400">
                  {(() => {
                    const note = String(settings.contact_note || '').trim();
                    if (locale === 'en' && hasPersianText(note)) {
                      return 'Submit a ticket or use online chat for the fastest response.';
                    }
                    return note || (locale === 'fa' ? 'برای پاسخ سریع‌تر، تیکت ثبت کنید یا از چت آنلاین استفاده کنید.' : 'Submit a ticket or use online chat for the fastest response.');
                  })()}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1">
                {contactChannels.map((channel) => (
                  <ContactChannelCard key={channel.href} channel={channel} />
                ))}
                {contactChannels.length === 0 && (
                  <div className="rounded-lg border border-white/10 bg-white/[0.06] p-5 text-sm leading-7 text-slate-300">
                    {locale === 'fa' ? 'هنوز راه ارتباطی مستقیمی در تنظیمات ثبت نشده است.' : 'No direct contact channel has been configured yet.'}
                  </div>
                )}
              </div>
            </section>

            <Card className="p-5 md:p-7">
              <div className="mb-6">
                <h2 className="text-2xl font-black text-white">{locale === 'fa' ? 'ثبت تیکت پشتیبانی' : 'Submit a support ticket'}</h2>
                <p className="mt-2 text-sm leading-7 text-slate-400">
                  {locale === 'fa' ? 'موضوع و توضیح درخواست را دقیق بنویسید تا تیم پشتیبانی سریع‌تر پاسخ دهد.' : 'Describe your request clearly so support can respond faster.'}
                </p>
              </div>

              {!ticketEnabled ? (
                <div className="rounded-lg border border-white/10 bg-white/[0.08] p-4 text-sm leading-7 text-slate-300">
                  {locale === 'fa' ? 'ثبت تیکت در حال حاضر غیرفعال است. از راه‌های ارتباطی دیگر استفاده کنید.' : 'Ticket submission is currently disabled. Please use another contact channel.'}
                </div>
              ) : (
                <>
                  {status && (
                    <div className="mb-5 flex items-start gap-2 rounded-lg border border-white/10 bg-white/[0.08] p-3 text-sm font-bold text-slate-200">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-200" />
                      <span>{status}</span>
                    </div>
                  )}

                  <form onSubmit={submitTicket} className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <FormField label={locale === 'fa' ? 'نام' : 'Name'}>
                        <input value={form.name} onChange={(event) => updateForm('name', event.target.value)} className="admin-input" required />
                      </FormField>
                      <FormField label={locale === 'fa' ? 'ایمیل' : 'Email'}>
                        <input type="email" value={form.email} onChange={(event) => updateForm('email', event.target.value)} className="admin-input" required />
                      </FormField>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <FormField label={locale === 'fa' ? 'شماره تماس' : 'Phone'}>
                        <input value={form.phone} onChange={(event) => updateForm('phone', event.target.value)} className="admin-input" />
                      </FormField>
                      <FormField label={locale === 'fa' ? 'موضوع' : 'Subject'}>
                        <input value={form.subject} onChange={(event) => updateForm('subject', event.target.value)} className="admin-input" required />
                      </FormField>
                    </div>
                    <FormField label={locale === 'fa' ? 'متن درخواست' : 'Message'}>
                      <textarea value={form.message} onChange={(event) => updateForm('message', event.target.value)} rows={6} className="admin-input resize-none" required />
                    </FormField>
                    <Button type="submit" size="lg" isLoading={isSaving} leftIcon={<Ticket className="h-5 w-5" />}>
                      {locale === 'fa' ? 'ثبت تیکت' : 'Submit ticket'}
                    </Button>
                  </form>
                </>
              )}
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function getContactChannels(settings: Record<string, unknown>, locale: string): ContactChannel[] {
  const channels: ContactChannel[] = [];
  const chatUrl = settingString(settings, 'online_chat_url');
  const supportEmail = settingString(settings, 'support_email');
  const supportPhone = settingString(settings, 'support_phone');
  const socialLinks = [
    { key: 'telegram_url', label: 'Telegram', icon: <Send className="h-5 w-5" /> },
    { key: 'instagram_url', label: 'Instagram', icon: <Share2 className="h-5 w-5" /> },
    { key: 'whatsapp_url', label: 'WhatsApp', icon: <MessageCircle className="h-5 w-5" /> },
    { key: 'linkedin_url', label: 'LinkedIn', icon: <Share2 className="h-5 w-5" /> },
  ];

  if (chatUrl) {
    const configuredLabel = settingString(settings, 'online_chat_label');
    channels.push({
      href: chatUrl,
      label: locale === 'en' && hasPersianText(configuredLabel)
        ? 'Online chat'
        : configuredLabel || (locale === 'fa' ? 'چت آنلاین' : 'Online chat'),
      detail: locale === 'fa' ? 'گفت‌وگوی مستقیم با پشتیبانی' : 'Talk directly with support',
      external: true,
      icon: <MessageCircle className="h-5 w-5" />,
    });
  }

  if (supportEmail) {
    channels.push({
      href: `mailto:${supportEmail}`,
      label: locale === 'fa' ? 'ایمیل پشتیبانی' : 'Support email',
      detail: supportEmail,
      external: true,
      icon: <Mail className="h-5 w-5" />,
    });
  }

  if (supportPhone) {
    channels.push({
      href: `tel:${supportPhone}`,
      label: locale === 'fa' ? 'تماس تلفنی' : 'Phone support',
      detail: supportPhone,
      external: true,
      icon: <Phone className="h-5 w-5" />,
    });
  }

  socialLinks.forEach((social) => {
    const href = settingString(settings, social.key);
    if (!href) return;
    channels.push({
      href,
      label: social.label,
      detail: locale === 'fa' ? 'ارتباط از طریق شبکه اجتماعی' : 'Social network contact',
      external: true,
      icon: social.icon,
    });
  });

  return channels;
}

function ContactChannelCard({ channel }: { channel: ContactChannel }) {
  const content = (
    <span className="flex min-h-[104px] items-start gap-4 rounded-lg border border-white/10 bg-white/[0.06] p-4 text-right transition hover:border-white/20 hover:bg-white/[0.09]">
      <span className="mt-1 rounded-lg bg-white/10 p-2 text-primary-100">{channel.icon}</span>
      <span className="min-w-0">
        <span className="block font-black text-white">{channel.label}</span>
        <span className="mt-2 block break-words text-sm leading-6 text-slate-400">{channel.detail}</span>
      </span>
    </span>
  );

  return channel.external ? (
    <a href={channel.href} target={channel.href.startsWith('http') ? '_blank' : undefined} rel={channel.href.startsWith('http') ? 'noreferrer' : undefined}>
      {content}
    </a>
  ) : (
    <Link href={channel.href}>{content}</Link>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-black text-slate-300">{label}</span>
      {children}
    </label>
  );
}
