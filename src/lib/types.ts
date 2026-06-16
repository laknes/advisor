// Type definitions for the Portfolio Advisor application

export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  phone?: string;
  country?: string;
  verified: boolean;
  createdAt: Date;
}

export interface Market {
  id: string;
  name: string;
  slug: string;
  symbol?: string;
  icon?: string;
  description?: string;
}

export interface Analysis {
  id: string;
  marketId: string;
  market?: Market;
  title: string;
  summary: string;
  fullContent?: string;
  timeframe: 'daily' | 'weekly' | 'monthly' | '3month' | '1year' | '3year';
  analysisType: 'short_term' | 'long_term';
  signal: 'BUY' | 'SELL' | 'HOLD';
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  targetPrice?: number;
  entryPrice?: number;
  stopLoss?: number;
  takeProfit?: number;
  accuracy?: number;
  publishedAt: Date;
  expiresAt?: Date;
  isLocked: boolean;
  requiredSubscription?: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  slug: string;
  description?: string;
  type: 'timeframe' | 'long_term' | 'market_full' | 'all_markets' | 'vip';
  marketId?: string;
  price: number;
  currency: string;
  billingPeriod: 'monthly' | 'quarterly' | 'yearly';
  features: string[];
  isActive: boolean;
}

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  plan?: SubscriptionPlan;
  marketId?: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  autoRenew: boolean;
}

export interface Portfolio {
  id: string;
  userId: string;
  totalValue: number;
  totalInvested: number;
  totalReturn: number;
  returnPercentage: number;
  positions: Position[];
}

export interface Position {
  id: string;
  portfolioId: string;
  symbol: string;
  quantity: number;
  entryPrice: number;
  currentPrice: number;
  totalCost: number;
  currentValue: number;
  profitLoss: number;
  profitLossPercent: number;
  type: 'stock' | 'forex' | 'gold' | 'currency';
}

export interface Price {
  id: string;
  symbol: string;
  currentPrice: number;
  previousClose?: number;
  dayHigh?: number;
  dayLow?: number;
  volume?: number;
  marketCap?: number;
  change?: number;
  changePercent?: number;
  timestamp: Date;
}

export interface Watchlist {
  id: string;
  userId: string;
  symbol: string;
  market: string;
  name?: string;
}

export interface PriceAlert {
  id: string;
  userId: string;
  symbol: string;
  market: string;
  condition: 'above' | 'below';
  price: number;
  isTriggered: boolean;
  triggeredAt?: Date;
  isActive: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'analysis' | 'alert' | 'subscription' | 'news';
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: Date;
}

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  transactionType: 'subscription' | 'wallet';
  planId?: string;
  discountCode?: string;
  createdAt: Date;
}
