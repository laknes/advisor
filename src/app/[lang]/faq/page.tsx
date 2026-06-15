'use client';

import { Header, Card, CardHeader, CardContent, Button } from '@/components';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Plus, Minus, HelpCircle } from 'lucide-react';

const faqs = [
  {
    question: "How does the daily analysis work?",
    answer: "Our team of expert analysts monitors the markets 24/7. Every morning before market open, we publish detailed reports with entry points, targets, and risk assessments for the day ahead."
  },
  {
    question: "What markets do you cover?",
    answer: "We currently provide professional analysis for Tehran Stock Exchange (Iran Stocks), Forex (Major Pairs), Gold & Precious Metals, and Global Currency markets."
  },
  {
    question: "Can I cancel my subscription at any time?",
    answer: "Yes, you can manage your subscription from your dashboard. If you cancel, you will maintain access until the end of your current billing period."
  },
  {
    question: "How accurate are your trading signals?",
    answer: "While no analysis can guarantee 100% success, our historical performance shows a win rate of approximately 68-75% across different markets. We emphasize risk management to ensure long-term profitability."
  },
  {
    question: "Do you offer personalized investment advice?",
    answer: "Personalized advisory is available through our VIP Elite and 1-Year Portfolio plans, where you get direct access to a dedicated market expert."
  }
];

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-secondary-50">
      <Header isAuthenticated={false} />

      <main className="py-20 md:py-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-black text-secondary-900 tracking-tight mb-6">
              Frequently Asked <span className="text-primary-600">Questions</span>
            </h1>
            <p className="text-xl text-secondary-600 font-medium">
              Everything you need to know about our platform and services.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <FAQItem key={index} question={faq.question} answer={faq.answer} />
            ))}
          </div>

          <div className="mt-20 text-center bg-white p-12 rounded-3xl shadow-xl border border-secondary-100">
            <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <HelpCircle className="w-8 h-8 text-primary-600" />
            </div>
            <h2 className="text-2xl font-bold text-secondary-900 mb-4">Still have questions?</h2>
            <p className="text-secondary-600 mb-8 max-w-md mx-auto">
              Can't find the answer you're looking for? Please chat to our friendly team.
            </p>
            <Button size="lg" className="px-10 h-14">Contact Support</Button>
          </div>
        </div>
      </main>
    </div>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div 
      initial={false}
      className="bg-white rounded-2xl border border-secondary-100 shadow-sm overflow-hidden"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-6 text-left hover:bg-secondary-50 transition-colors"
      >
        <span className="text-lg font-bold text-secondary-900">{question}</span>
        <div className={`p-2 rounded-lg transition-colors ${isOpen ? 'bg-primary-600 text-white' : 'bg-secondary-100 text-secondary-500'}`}>
          {isOpen ? <Minus className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
        </div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <div className="p-6 pt-0 text-secondary-600 leading-relaxed text-lg border-t border-secondary-50 mt-4">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
