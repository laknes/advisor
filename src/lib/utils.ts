import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatPercent(value: number, decimals: number = 2): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

export function formatNumber(value: number, decimals: number = 2): string {
  return value.toFixed(decimals);
}

export function formatDate(date: Date | string, format: 'short' | 'long' = 'short'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  if (format === 'short') {
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
  
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

export function calculateChange(current: number, previous: number): { change: number; percent: number } {
  const change = current - previous;
  const percent = (change / previous) * 100;
  return { change, percent };
}

export function getSignalColor(signal: 'BUY' | 'SELL' | 'HOLD'): string {
  switch (signal) {
    case 'BUY':
      return 'text-primary-900 bg-primary-100 border-primary-200';
    case 'SELL':
      return 'text-danger bg-red-50 border-red-200';
    case 'HOLD':
      return 'text-primary-900 bg-white border-primary-200';
    default:
      return 'text-secondary-600 bg-secondary-50';
  }
}

export function getRiskColor(level: 'LOW' | 'MEDIUM' | 'HIGH'): string {
  switch (level) {
    case 'LOW':
      return 'text-primary-900 bg-primary-100 border-primary-200';
    case 'MEDIUM':
      return 'text-primary-900 bg-white border-primary-200';
    case 'HIGH':
      return 'text-danger bg-red-50 border-red-200';
    default:
      return 'text-secondary-600 bg-secondary-50';
  }
}

export function getProfitLossColor(value: number): string {
  if (value > 0) return 'text-primary-600';
  if (value < 0) return 'text-danger';
  return 'text-secondary-600';
}

export function truncateText(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + '...';
}

export function generateId(): string {
  return Math.random().toString(36).slice(2, 11);
}

export function isSubscriptionActive(endDate: Date | string): boolean {
  const date = typeof endDate === 'string' ? new Date(endDate) : endDate;
  return date > new Date();
}

export function getDaysUntilExpiry(endDate: Date | string): number {
  const now = new Date();
  const date = typeof endDate === 'string' ? new Date(endDate) : endDate;
  const diffTime = date.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}
