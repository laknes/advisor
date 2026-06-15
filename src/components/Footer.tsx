'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Globe, 
  ShieldCheck, 
  Scale, 
  HelpCircle, 
  Mail, 
  Phone,
  MessageSquare,
  Share2,
  ExternalLink
} from 'lucide-react';

import { useLocale } from './LocaleProvider';
import { useDictionary } from './useDictionary';

export const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { locale } = useLocale();
  const dict = useDictionary();

  if (!dict) return null;

  return (
    <footer className="bg-[#160022]/92 border-t border-white/10 pt-16 pb-8 text-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <Link href={`/${locale}`} className="flex items-center gap-2 mb-6 group">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform">
                <span className="text-primary-900 font-black text-lg">مپ</span>
              </div>
              <span className="text-xl font-black text-white">مشاور پورتفو</span>
            </Link>
            <p className="text-slate-300 mb-6 leading-relaxed">
              {dict.footer.description}
            </p>
            <div className="flex gap-4">
              <SocialLink icon={<MessageSquare className="w-5 h-5" />} href="#" />
              <SocialLink icon={<Share2 className="w-5 h-5" />} href="#" />
              <SocialLink icon={<ExternalLink className="w-5 h-5" />} href="#" />
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-black text-white mb-6">{dict.footer.platform}</h3>
            <ul className="space-y-4">
              <FooterLink href={`/${locale}/markets`}>{dict.common.markets}</FooterLink>
              <FooterLink href={`/${locale}/analyses`}>{dict.common.analyses}</FooterLink>
              <FooterLink href={`/${locale}/pricing`}>{dict.common.pricing}</FooterLink>
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
              <li className="flex items-center gap-3 text-slate-300">
                <Mail className="w-5 h-5 text-white" />
                <span>support@advisor.com</span>
              </li>
              <li className="flex items-center gap-3 text-slate-300">
                <Phone className="w-5 h-5 text-white" />
                <span>+۱ (۵۵۵) ۱۲۳-۴۵۶۷</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-400 text-sm">
            © {currentYear} مشاور پورتفو. {dict.footer.all_rights_reserved}
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

const SocialLink = ({ icon, href }: { icon: React.ReactNode; href: string }) => (
  <a 
    href={href} 
    className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-slate-300 hover:bg-white/15 hover:text-white transition-all"
  >
    {icon}
  </a>
);
