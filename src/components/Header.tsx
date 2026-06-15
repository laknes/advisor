'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronDown, LayoutDashboard, User, CreditCard, LogOut } from 'lucide-react';
import { Button } from './Button';
import { cn } from '@/lib/utils';
import { useLocale } from './LocaleProvider';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useDictionary } from './useDictionary';

interface HeaderProps {
  isAuthenticated?: boolean;
  userName?: string;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ isAuthenticated = false, userName, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { locale } = useLocale();
  const dict = useDictionary();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!dict) return null;

  return (
    <header className={cn(
      "sticky top-0 z-50 transition-all duration-300",
      scrolled ? "bg-[#160022]/82 backdrop-blur-2xl border-b border-white/10 shadow-2xl shadow-black/20 py-2" : "bg-transparent border-b border-white/10 py-4"
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center gap-2 hover:opacity-80 transition-opacity group">
            <motion.div 
              whileHover={{ rotate: 10, scale: 1.1 }}
              className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-lg shadow-primary-900/30"
            >
              <span className="text-primary-900 font-black text-lg">مپ</span>
            </motion.div>
            <span className="hidden md:block text-xl font-black text-white">مشاور پورتفو</span>
          </Link>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex items-center gap-1">
            <NavLink href={`/${locale}/markets`}>{dict.common.markets}</NavLink>
            <NavLink href={`/${locale}/analyses`}>{dict.common.analyses}</NavLink>
            <NavLink href={`/${locale}/pricing`}>{dict.common.pricing}</NavLink>
            <NavLink href={`/${locale}/about`}>{dict.common.about}</NavLink>
          </nav>

          {/* Auth Buttons */}
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            
            {isAuthenticated ? (
              <>
                <Link href={`/${locale}/dashboard`} className="hidden sm:block">
                  <Button variant="ghost" size="sm" leftIcon={<LayoutDashboard className="w-4 h-4" />}>
                    {dict.common.dashboard}
                  </Button>
                </Link>
                <div className="relative group">
                  <Button variant="secondary" size="sm" rightIcon={<ChevronDown className="w-4 h-4" />}>
                    {userName || 'حساب کاربری'}
                  </Button>
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    whileHover={{ opacity: 1, y: 0, scale: 1 }}
                    className="absolute right-0 mt-2 w-56 glass-panel rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 overflow-hidden"
                  >
                    <Link href={`/${locale}/dashboard/profile`}>
                      <button className="flex items-center gap-3 w-full text-right px-4 py-3 text-slate-200 hover:bg-white/10 border-b border-white/10 transition-colors">
                        <User className="w-4 h-4 text-primary-200" />
                        <span>{dict.dashboard.settings}</span>
                      </button>
                    </Link>
                    <Link href={`/${locale}/dashboard/subscriptions`}>
                      <button className="flex items-center gap-3 w-full text-right px-4 py-3 text-slate-200 hover:bg-white/10 border-b border-white/10 transition-colors">
                        <CreditCard className="w-4 h-4 text-primary-200" />
                        <span>{dict.dashboard.subscriptions}</span>
                      </button>
                    </Link>
                    <button
                      onClick={onLogout}
                      className="flex items-center gap-3 w-full text-right px-4 py-3 text-red-300 hover:bg-red-500/10 font-medium transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>{dict.common.logout}</span>
                    </button>
                  </motion.div>
                </div>
              </>
            ) : (
              <>
                <Link href={`/${locale}/auth/login`} className="hidden sm:block">
                  <Button variant="ghost" size="sm">
                    {dict.common.login}
                  </Button>
                </Link>
                <Link href={`/${locale}/auth/signup`}>
                  <Button size="sm">{dict.common.signup}</Button>
                </Link>
              </>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 hover:bg-white/10 rounded-lg transition-colors text-white"
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
              className="md:hidden border-t border-white/10 py-4 space-y-2 overflow-hidden"
            >
              <MobileNavLink href={`/${locale}/markets`}>{dict.common.markets}</MobileNavLink>
              <MobileNavLink href={`/${locale}/analyses`}>{dict.common.analyses}</MobileNavLink>
              <MobileNavLink href={`/${locale}/pricing`}>{dict.common.pricing}</MobileNavLink>
              <MobileNavLink href={`/${locale}/about`}>{dict.common.about}</MobileNavLink>
              {isAuthenticated && (
                <MobileNavLink href={`/${locale}/dashboard`}>{dict.common.dashboard}</MobileNavLink>
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

const MobileNavLink: React.FC<NavLinkProps> = ({ href, children }) => (
  <Link 
    href={href}
    className="block px-4 py-2 text-slate-200 hover:bg-white/10 rounded-lg transition-colors duration-200"
  >
    {children}
  </Link>
);
