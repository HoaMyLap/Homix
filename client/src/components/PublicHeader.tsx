'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ThemeToggle from '@/components/ThemeToggle';
import { useLanguage } from '@/lib/i18n';
import { Menu, X } from 'lucide-react';

export default function PublicHeader() {
  const pathname = usePathname();
  const { t, language, setLanguage } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '/', label: t('home') },
    { href: '/features', label: t('features') },
    { href: '/pricing', label: t('pricing') },
    { href: '/terms', label: t('terms') },
    { href: '/contact', label: t('contact') },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-header/85 backdrop-blur-md px-4 sm:px-6 py-1 h-20 flex items-center">
      <div className="max-w-6xl w-full mx-auto flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center group shrink-0">
          <img
            src="/logo2.png"
            alt="Homix Logo"
            style={{ transform: 'scale(1.3)', transformOrigin: 'left center' }}
            className="h-14 sm:h-18 w-auto object-contain group-hover:scale-[1.02] transition-transform"
          />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm transition-all ${
                  isActive
                    ? 'font-bold text-primary'
                    : 'font-semibold text-secondary hover:text-primary'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Controls */}
        <div className="flex items-center gap-2.5 sm:gap-4">
          <button
            type="button"
            onClick={() => setLanguage(language === 'vi' ? 'en' : 'vi')}
            aria-label={language === 'vi' ? 'Switch to English' : 'Chuyển sang Tiếng Việt'}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-surface hover:border-primary/40 text-xs font-bold text-heading transition-all shadow-sm cursor-pointer"
            title="Đổi ngôn ngữ / Change language"
          >
            <span>{language === 'vi' ? '🇻🇳 VI' : '🇬🇧 EN'}</span>
          </button>

          <ThemeToggle />

          <Link
            href="/login"
            className="hidden sm:inline-flex text-sm font-semibold text-secondary hover:text-primary transition-all"
          >
            {t('login')}
          </Link>

          <Link
            href="/register"
            className="hidden sm:inline-flex ui-btn-primary px-4 py-2 text-sm shadow-md shadow-primary/10"
          >
            {t('startFree')}
          </Link>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className="md:hidden p-2 rounded-xl border border-border bg-surface text-heading"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-20 inset-x-0 bg-header/95 backdrop-blur-xl border-b border-border p-4 shadow-2xl flex flex-col gap-2 z-50">
          {navLinks.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-2.5 rounded-xl text-sm transition-all ${
                  isActive
                    ? 'bg-primary/10 font-bold text-primary'
                    : 'font-semibold text-secondary hover:bg-hover hover:text-primary'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          <div className="pt-2 mt-1 border-t border-border-subtle flex items-center gap-3">
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="ui-btn-secondary flex-1 py-2.5 text-center text-xs font-bold"
            >
              {t('login')}
            </Link>
            <Link
              href="/register"
              onClick={() => setMobileMenuOpen(false)}
              className="ui-btn-primary flex-1 py-2.5 text-center text-xs font-bold"
            >
              {t('startFree')}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
