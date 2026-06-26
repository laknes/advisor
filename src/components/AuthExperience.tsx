'use client';

import { motion } from 'framer-motion';
import { Activity, BadgeDollarSign, LineChart, ShieldCheck, Sparkles } from 'lucide-react';
import { Header } from './Header';
import { MarketOrbitScene } from './MarketOrbitScene';

const marketSignals = [
  { label: 'بورس', value: '+۲.۸٪', icon: LineChart },
  { label: 'طلا', value: '۲۳۲۱', icon: Sparkles },
  { label: 'ریسک', value: 'کم', icon: ShieldCheck },
  { label: 'ارز', value: '+۰.۹٪', icon: BadgeDollarSign },
];

interface AuthExperienceProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

export function AuthExperience({ title, subtitle, children }: AuthExperienceProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#070814] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(34,211,238,0.28),transparent_28rem),radial-gradient(circle_at_82%_14%,rgba(168,85,247,0.24),transparent_24rem),linear-gradient(135deg,#070814_0%,#11102a_44%,#050711_100%)]" />
      <div className="absolute inset-0 auth-data-grid opacity-70" />
      <Header isAuthenticated={false} />

      <main className="relative z-10 mx-auto grid min-h-[calc(100vh-64px)] w-full max-w-7xl grid-cols-1 items-center gap-8 px-4 py-8 md:grid-cols-[1.05fr_0.95fr] md:px-8 lg:px-10">
        <section className="relative order-2 min-h-[360px] overflow-hidden rounded-lg border border-white/10 bg-white/[0.035] shadow-2xl shadow-cyan-950/30 backdrop-blur-md md:order-1 md:min-h-[620px]">
          <MarketOrbitScene />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(7,8,20,0.08),transparent_48%,rgba(7,8,20,0.34))]" />
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="absolute bottom-4 left-4 right-4"
          >
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {marketSignals.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="rounded-lg border border-white/10 bg-black/20 p-3 backdrop-blur-xl">
                    <div className="mb-2 flex items-center gap-2 text-xs text-slate-300">
                      <Icon className="h-4 w-4 text-cyan-200" />
                      <span>{item.label}</span>
                    </div>
                    <div className="font-ui text-lg font-bold text-white">{item.value}</div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </section>

        <motion.section
          initial={{ opacity: 0, x: 28 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.75, ease: 'easeOut' }}
          className="order-1 md:order-2"
        >
          <div className="relative overflow-hidden rounded-lg border border-white/15 bg-white/[0.11] p-5 shadow-2xl shadow-black/30 backdrop-blur-2xl sm:p-7 lg:p-8">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-l from-transparent via-cyan-200/70 to-transparent" />
            <div className="mb-7 flex items-start justify-between gap-4">
              <div>
                <h1 className="text-4xl text-white sm:text-5xl">{title}</h1>
                <p className="mt-3 max-w-md text-sm leading-7 text-slate-300 sm:text-base">{subtitle}</p>
              </div>
              <div className="hidden rounded-lg border border-cyan-200/20 bg-cyan-200/10 p-3 text-cyan-100 sm:block">
                <Activity className="h-5 w-5" />
              </div>
            </div>
            {children}
          </div>
        </motion.section>
      </main>
    </div>
  );
}
