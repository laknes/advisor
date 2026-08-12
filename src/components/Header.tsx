'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronDown, LayoutDashboard, User, CreditCard, LogOut, Moon, Sun } from 'lucide-react';
import { Button } from './Button';
import { cn } from '@/lib/utils';
import { useLocale } from './LocaleProvider';
import { useTheme } from './ThemeProvider';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useDictionary } from './useDictionary';
import { getBrandLogoUrl, getBrandName, usePublicSettings } from './usePublicSettings';
import { clearStoredAuth, getStoredToken, getStoredUser, type StoredUser } from '@/lib/clientAuth';

interface HeaderProps {
  isAuthenticated?: boolean;
  userName?: string;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ isAuthenticated = false, userName, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [storedUser, setStoredUser] = useState<StoredUser | null>(null);
  const [hasStoredToken, setHasStoredToken] = useState(false);
  const accountMenuRef = React.useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  const { locale } = useLocale();
  const { theme, toggleTheme } = useTheme();
  const dict = useDictionary();
  const publicSettings = usePublicSettings();
  const brandName = getBrandName(publicSettings, locale);
  const logoUrl = getBrandLogoUrl(publicSettings);
  const contactEnabled = publicSettings.contact_menu_enabled !== false;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const syncAuthState = () => {
      setStoredUser(getStoredUser());
      setHasStoredToken(Boolean(getStoredToken()));
    };

    syncAuthState();
    window.addEventListener('storage', syncAuthState);
    window.addEventListener('auth-changed', syncAuthState);

    return () => {
      window.removeEventListener('storage', syncAuthState);
      window.removeEventListener('auth-changed', syncAuthState);
    };
  }, []);

  useEffect(() => {
    if (!isAccountMenuOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!accountMenuRef.current?.contains(event.target as Node)) {
        setIsAccountMenuOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsAccountMenuOpen(false);
      }
    };

    window.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('keydown', handleEscape);

    return () => {
      window.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isAccountMenuOpen]);

  const authenticated = isAuthenticated || hasStoredToken;
  const storedEmail = storedUser?.email?.endsWith('@otp.local') ? '' : storedUser?.email;
  const displayName = userName || storedUser?.name || storedUser?.phone || storedEmail || (locale === 'en' ? 'My Account' : 'حساب کاربری');

  const handleLogout = () => {
    setIsAccountMenuOpen(false);
    setIsMenuOpen(false);
    if (onLogout) {
      onLogout();
    } else {
      clearStoredAuth();
      setStoredUser(null);
      setHasStoredToken(false);
      router.push(`/${locale}/auth/login`);
    }
    window.dispatchEvent(new Event('auth-changed'));
  };

  if (!dict) return null;

  return (
    <header className={cn(
      "sticky top-0 z-50 transition-all duration-300",
      scrolled ? "bg-[#160022]/92 backdrop-blur-2xl border-b border-white/10 shadow-2xl shadow-black/20 py-2" : "bg-[#160022]/96 backdrop-blur-xl border-b border-white/10 py-4"
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center gap-2 hover:opacity-80 transition-opacity group">
            <motion.div 
              whileHover={{ rotate: 10, scale: 1.1 }}
              className="w-10 h-10 overflow-hidden bg-white rounded-lg flex items-center justify-center shadow-lg shadow-primary-900/30"
            >
              {logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoUrl} alt={brandName} className="h-full w-full object-contain p-1" />
              ) : (
                <span className="text-primary-900 font-black text-lg">{locale === 'en' ? 'MI' : 'سم'}</span>
              )}
            </motion.div>
            <span className="hidden md:block text-xl font-black text-white">{brandName}</span>
          </Link>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex items-center gap-1">
            <NavLink href={`/${locale}/markets`}>{dict.common.markets}</NavLink>
            <NavLink href={`/${locale}/analyses`}>{dict.common.analyses}</NavLink>
            <NavLink href={`/${locale}/pricing`}>{dict.common.pricing}</NavLink>
            <NavLink href={`/${locale}/about`}>{dict.common.about}</NavLink>
            {contactEnabled && (
              <NavLink href={`/${locale}/contact`}>{dict.common.contact}</NavLink>
            )}
          </nav>

          {/* Auth Buttons */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleTheme}
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/15 bg-white/10 text-slate-100 transition hover:bg-white/15"
              aria-label={theme === 'night' ? (locale === 'en' ? 'Enable light mode' : 'فعال کردن لایت مد') : (locale === 'en' ? 'Enable dark mode' : 'فعال کردن نایت مد')}
              title={theme === 'night' ? (locale === 'en' ? 'Light mode' : 'لایت مد') : (locale === 'en' ? 'Dark mode' : 'نایت مد')}
            >
              {theme === 'night' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <LanguageSwitcher />
            
            {authenticated ? (
              <>
                <Link
                  href={`/${locale}/dashboard`}
                  className="hidden sm:inline-flex items-center justify-center gap-2 rounded-lg px-3 py-1.5 text-sm font-bold text-slate-200 transition-colors duration-200 hover:bg-white/10"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  {dict.common.dashboard}
                </Link>
                <div ref={accountMenuRef} className="relative">
                  <Button
                    variant="secondary"
                    size="sm"
                    rightIcon={<ChevronDown className="w-4 h-4" />}
                    aria-expanded={isAccountMenuOpen}
                    aria-haspopup="menu"
                    aria-controls="header-account-menu"
                    onClick={() => setIsAccountMenuOpen((open) => !open)}
                  >
                    {displayName}
                  </Button>
                  <div
                    id="header-account-menu"
                    role="menu"
                    className={cn(
                      'absolute right-0 top-full z-50 w-56 pt-2 transition-all duration-150 ease-out',
                      isAccountMenuOpen ? 'visible translate-y-0 scale-100 opacity-100' : 'invisible translate-y-1 scale-95 opacity-0',
                    )}
                  >
                    <div className="overflow-hidden rounded-lg border border-white/15 bg-[#12001d]/95 shadow-2xl shadow-black/40 ring-1 ring-white/10 backdrop-blur-md">
                      <Link
                        href={`/${locale}/dashboard/profile`}
                        role="menuitem"
                        className="flex w-full items-center gap-3 border-b border-white/10 px-4 py-3 text-right text-slate-200 transition-colors hover:bg-white/10"
                        onClick={() => setIsAccountMenuOpen(false)}
                      >
                        <User className="w-4 h-4 text-primary-200" />
                        <span>{dict.dashboard.settings}</span>
                      </Link>
                      <Link
                        href={`/${locale}/dashboard/subscriptions`}
                        role="menuitem"
                        className="flex w-full items-center gap-3 border-b border-white/10 px-4 py-3 text-right text-slate-200 transition-colors hover:bg-white/10"
                        onClick={() => setIsAccountMenuOpen(false)}
                      >
                        <CreditCard className="w-4 h-4 text-primary-200" />
                        <span>{dict.dashboard.subscriptions}</span>
                      </Link>
                      <button
                        onClick={handleLogout}
                        role="menuitem"
                        className="flex w-full items-center gap-3 px-4 py-3 text-right font-medium text-red-300 transition-colors hover:bg-red-500/10"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>{dict.common.logout}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link
                  href={`/${locale}/auth/login`}
                  className="hidden sm:inline-flex items-center justify-center rounded-lg px-3 py-1.5 text-sm font-bold text-slate-200 transition-colors duration-200 hover:bg-white/10"
                >
                  {dict.common.login}
                </Link>
                <Link
                  href={`/${locale}/auth/signup`}
                  className="inline-flex items-center justify-center rounded-lg bg-primary-600 px-3 py-1.5 text-sm font-bold text-white shadow-lg shadow-primary-900/25 transition-colors duration-200 hover:bg-primary-700"
                >
                  {dict.common.signup}
                </Link>
              </>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 hover:bg-white/10 rounded-lg transition-colors text-white"
              aria-expanded={isMenuOpen}
              aria-controls="header-mobile-menu"
              aria-label={isMenuOpen ? (locale === 'fa' ? 'بستن منو' : 'Close menu') : (locale === 'fa' ? 'باز کردن منو' : 'Open menu')}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              id="header-mobile-menu"
              className="md:hidden border-t border-white/10 py-4 space-y-2 overflow-hidden"
            >
              <MobileNavLink href={`/${locale}/markets`} onClick={() => setIsMenuOpen(false)}>{dict.common.markets}</MobileNavLink>
              <MobileNavLink href={`/${locale}/analyses`} onClick={() => setIsMenuOpen(false)}>{dict.common.analyses}</MobileNavLink>
              <MobileNavLink href={`/${locale}/pricing`} onClick={() => setIsMenuOpen(false)}>{dict.common.pricing}</MobileNavLink>
              <MobileNavLink href={`/${locale}/about`} onClick={() => setIsMenuOpen(false)}>{dict.common.about}</MobileNavLink>
              {contactEnabled && <MobileNavLink href={`/${locale}/contact`} onClick={() => setIsMenuOpen(false)}>{dict.common.contact}</MobileNavLink>}
              {authenticated ? (
                <>
                  <MobileNavLink href={`/${locale}/dashboard`} onClick={() => setIsMenuOpen(false)}>{dict.common.dashboard}</MobileNavLink>
                  <button
                    onClick={handleLogout}
                    className="block w-full rounded-lg px-4 py-2 text-right text-red-300 transition-colors duration-200 hover:bg-red-500/10"
                  >
                    {dict.common.logout}
                  </button>
                </>
              ) : (
                <>
                  <MobileNavLink href={`/${locale}/auth/login`} onClick={() => setIsMenuOpen(false)}>{dict.common.login}</MobileNavLink>
                  <MobileNavLink href={`/${locale}/auth/signup`} onClick={() => setIsMenuOpen(false)}>{dict.common.signup}</MobileNavLink>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  onClick?: () => void;
}

const NavLink: React.FC<NavLinkProps> = ({ href, children }) => (
  <Link 
    href={href}
    className="relative px-3 py-2 text-slate-300 hover:text-white font-bold transition-colors duration-200 group"
  >
    {children}
    <motion.span 
      className="absolute bottom-0 left-0 w-full h-0.5 bg-white scale-x-0 group-hover:scale-x-100 transition-transform origin-left"
      initial={false}
    />
  </Link>
);

const MobileNavLink: React.FC<NavLinkProps> = ({ href, children, onClick }) => (
  <Link 
    href={href}
    onClick={onClick}
    className="block px-4 py-2 text-slate-200 hover:bg-white/10 rounded-lg transition-colors duration-200"
  >
    {children}
  </Link>
);
