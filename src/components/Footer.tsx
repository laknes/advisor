'use client';

import Link from 'next/link';
import { 
  Globe, 
  ShieldCheck, 
  Scale, 
  HelpCircle, 
  Mail, 
  Phone,
  MessageSquare,
  Share2,
  ExternalLink,
  LifeBuoy,
} from 'lucide-react';

import { useLocale } from './LocaleProvider';
import { useDictionary } from './useDictionary';
import { getBrandLogoUrl, getBrandName, usePublicSettings } from './usePublicSettings';

export const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { locale } = useLocale();
  const dict = useDictionary();
  const publicSettings = usePublicSettings();
  const brandName = getBrandName(publicSettings, locale);
  const logoUrl = getBrandLogoUrl(publicSettings);
  const supportEmail = String(publicSettings.support_email || 'support@advisor.com');
  const supportPhone = String(publicSettings.support_phone || '');
  const chatUrl = String(publicSettings.online_chat_url || publicSettings.whatsapp_url || '');
  const externalUrl = String(publicSettings.telegram_url || publicSettings.linkedin_url || publicSettings.instagram_url || '');
  const contactHref = `/${locale}/contact`;

  const handleShare = async () => {
    const shareUrl = window.location.origin;
    const shareTitle = brandName;

    try {
      if (navigator.share) {
        await navigator.share({ title: shareTitle, url: shareUrl });
        return;
      }

      await navigator.clipboard.writeText(shareUrl);
      window.alert(locale === 'fa' ? 'لینک سایت کپی شد.' : 'Site link copied.');
    } catch {
      window.alert(locale === 'fa' ? 'امکان اشتراک‌گذاری لینک وجود ندارد.' : 'Unable to share the link.');
    }
  };

  if (!dict) return null;

  return (
    <footer className="bg-[color:var(--theme-header)] border-t border-[color:var(--theme-border)] pt-16 pb-8 text-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <Link href={`/${locale}`} className="flex items-center gap-2 mb-6 group">
              <div className="w-10 h-10 overflow-hidden bg-white rounded-lg flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform">
                {logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logoUrl} alt={brandName} className="h-full w-full object-contain p-1" />
                ) : (
                  <span className="text-primary-900 font-black text-lg">{locale === 'en' ? 'MI' : 'سم'}</span>
                )}
              </div>
              <span className="text-xl font-black text-white">{brandName}</span>
            </Link>
            <p className="text-slate-300 mb-6 leading-relaxed">
              {dict.footer.description}
            </p>
            <div className="flex gap-4">
              <SocialLink
                icon={<MessageSquare className="w-5 h-5" />}
                href={chatUrl || contactHref}
                label={locale === 'fa' ? 'تماس یا چت با پشتیبانی' : 'Contact support'}
                external={Boolean(chatUrl)}
              />
              <SocialLink
                icon={<Share2 className="w-5 h-5" />}
                label={locale === 'fa' ? 'اشتراک‌گذاری سایت' : 'Share site'}
                onClick={handleShare}
              />
              <SocialLink
                icon={<ExternalLink className="w-5 h-5" />}
                href={externalUrl || contactHref}
                label={locale === 'fa' ? 'باز کردن شبکه اجتماعی' : 'Open social channel'}
                external={Boolean(externalUrl)}
              />
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-black text-white mb-6">{dict.footer.platform}</h3>
            <ul className="space-y-4">
              <FooterLink href={`/${locale}/markets`}>{dict.common.markets}</FooterLink>
              <FooterLink href={`/${locale}/analyses`}>{dict.common.analyses}</FooterLink>
              <FooterLink href={`/${locale}/dashboard`}>{dict.common.dashboard}</FooterLink>
            </ul>
          </div>

          {/* Legal & Support */}
          <div>
            <h3 className="text-sm font-black text-white mb-6">{dict.footer.legal_support}</h3>
            <ul className="space-y-4">
              <FooterLink href={`/${locale}/faq`} icon={<HelpCircle className="w-4 h-4" />}>{dict.common.faq}</FooterLink>
              <FooterLink href={`/${locale}/terms`} icon={<Scale className="w-4 h-4" />}>{dict.common.terms}</FooterLink>
              <FooterLink href={`/${locale}/disclaimer`} icon={<ShieldCheck className="w-4 h-4" />}>{dict.common.disclaimer}</FooterLink>
              <FooterLink href={`/${locale}/privacy`} icon={<Globe className="w-4 h-4" />}>{dict.common.privacy}</FooterLink>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-black text-white mb-6">{dict.footer.contact_us}</h3>
            <ul className="space-y-4">
              <FooterLink href={`/${locale}/contact`} icon={<LifeBuoy className="w-4 h-4" />}>{dict.footer.contact_us}</FooterLink>
              {supportEmail && (
                <li className="flex items-center gap-3 text-slate-300">
                  <Mail className="w-5 h-5 text-white" />
                  <span className="break-all">{supportEmail}</span>
                </li>
              )}
              {supportPhone && (
                <li className="flex items-center gap-3 text-slate-300">
                  <Phone className="w-5 h-5 text-white" />
                  <span>{supportPhone}</span>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-400 text-sm">
            © {currentYear} {brandName}. {dict.footer.all_rights_reserved}
          </p>
          <div className="flex gap-8">
            <Link href={`/${locale}/terms`} className="text-slate-400 hover:text-white text-sm transition-colors">{dict.common.terms}</Link>
            <Link href={`/${locale}/privacy`} className="text-slate-400 hover:text-white text-sm transition-colors">{dict.common.privacy}</Link>
            <Link href={`/${locale}/disclaimer`} className="text-slate-400 hover:text-white text-sm transition-colors">{dict.common.disclaimer}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

const FooterLink = ({ href, children, icon }: { href: string; children: React.ReactNode; icon?: React.ReactNode }) => (
  <li>
    <Link href={href} className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 group">
      {icon && <span className="text-slate-500 group-hover:text-white transition-colors">{icon}</span>}
      <span>{children}</span>
    </Link>
  </li>
);

const socialLinkClassName = 'w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-slate-300 hover:bg-white/15 hover:text-white transition-all focus:outline-none focus:ring-2 focus:ring-primary-200';

const SocialLink = ({
  icon,
  href,
  label,
  external = false,
  onClick,
}: {
  icon: React.ReactNode;
  href?: string;
  label: string;
  external?: boolean;
  onClick?: () => void;
}) => {
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={socialLinkClassName} aria-label={label} title={label}>
        {icon}
      </button>
    );
  }

  return (
    <a
      href={href || '#'}
      className={socialLinkClassName}
      aria-label={label}
      title={label}
      target={external ? '_blank' : undefined}
      rel={external ? 'noreferrer' : undefined}
    >
      {icon}
    </a>
  );
};
