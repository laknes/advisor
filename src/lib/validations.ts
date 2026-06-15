import { z } from 'zod';

// Auth Schemas
export const RegisterSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  country: z.string().optional(),
});

export const LoginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export const UpdateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  phone: z.string().optional(),
  country: z.string().optional(),
  avatar: z.string().url('Invalid URL').optional(),
});

// Analysis Schemas
export const CreateAnalysisSchema = z.object({
  marketId: z.string().cuid('Invalid market ID'),
  title: z.string().min(5, 'Title must be at least 5 characters'),
  summary: z.string().min(20, 'Summary must be at least 20 characters'),
  fullContent: z.string().min(50, 'Content must be at least 50 characters'),
  timeframe: z.enum(['daily', 'weekly', 'monthly', '3month', '1year', '3year']),
  analysisType: z.enum(['short_term', 'long_term']),
  signal: z.enum(['BUY', 'SELL', 'HOLD']),
  riskLevel: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  targetPrice: z.number().positive().optional(),
  entryPrice: z.number().positive().optional(),
  stopLoss: z.number().positive().optional(),
  takeProfit: z.number().positive().optional(),
  accuracy: z.number().min(0).max(100).optional(),
  requiredSubscription: z.string().optional(),
  isLocked: z.boolean().default(false),
});

// Portfolio Schemas
export const CreatePositionSchema = z.object({
  symbol: z.string().min(1, 'Symbol is required'),
  quantity: z.number().positive('Quantity must be positive'),
  entryPrice: z.number().positive('Entry price must be positive'),
  type: z.enum(['stock', 'forex', 'gold', 'currency']),
});

export const UpdatePositionSchema = z.object({
  quantity: z.number().positive('Quantity must be positive').optional(),
  currentPrice: z.number().positive('Current price must be positive').optional(),
});

// Watchlist Schemas
export const AddToWatchlistSchema = z.object({
  symbol: z.string().min(1, 'Symbol is required'),
  market: z.string().min(1, 'Market is required'),
  name: z.string().optional(),
});

// Price Alert Schemas
export const CreatePriceAlertSchema = z.object({
  symbol: z.string().min(1, 'Symbol is required'),
  market: z.string().min(1, 'Market is required'),
  price: z.number().positive('Price must be positive'),
  condition: z.enum(['above', 'below']),
  isActive: z.boolean().default(true),
});

export const UpdatePriceAlertSchema = CreatePriceAlertSchema.partial();

// Subscription Schemas
export const CreateSubscriptionSchema = z.object({
  planId: z.string().cuid('Invalid plan ID'),
  marketId: z.string().cuid('Invalid market ID').optional(),
});

export const CreateMarketSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/),
  symbol: z.string().optional(),
  icon: z.string().optional(),
  description: z.string().optional(),
});

export const UpdateMarketSchema = CreateMarketSchema.partial();

export const CreateSubscriptionPlanSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/),
  description: z.string().optional(),
  type: z.enum(['timeframe', 'long_term', 'market_full', 'all_markets', 'vip']),
  marketId: z.string().cuid().optional(),
  price: z.number().nonnegative(),
  currency: z.string().default('USD'),
  billingPeriod: z.enum(['monthly', 'quarterly', 'yearly']),
  features: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
});

export const UpdateSubscriptionPlanSchema = CreateSubscriptionPlanSchema.partial();

export const CreateDiscountCodeSchema = z.object({
  code: z.string().min(2).transform((value) => value.toUpperCase()),
  description: z.string().optional(),
  discountType: z.enum(['percentage', 'fixed']),
  discountValue: z.number().positive(),
  maxUses: z.number().int().positive().optional(),
  validFrom: z.coerce.date(),
  validUntil: z.coerce.date(),
  isActive: z.boolean().default(true),
});

export const UpdateDiscountCodeSchema = CreateDiscountCodeSchema.partial();

export const CreateAdminUserSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  country: z.string().optional(),
  verified: z.boolean().optional(),
});

export const UpdateAdminUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  email: z.string().email('Invalid email format').optional(),
  country: z.string().optional(),
  verified: z.boolean().optional(),
});

export const UpdateAnalysisSchema = CreateAnalysisSchema.partial().extend({
  marketId: z.string().cuid('Invalid market ID').optional(),
});

// Type exports
export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;
export type CreateAnalysisInput = z.infer<typeof CreateAnalysisSchema>;
export type UpdateAnalysisInput = z.infer<typeof UpdateAnalysisSchema>;
export type CreatePositionInput = z.infer<typeof CreatePositionSchema>;
export type UpdatePositionInput = z.infer<typeof UpdatePositionSchema>;
export type AddToWatchlistInput = z.infer<typeof AddToWatchlistSchema>;
export type CreatePriceAlertInput = z.infer<typeof CreatePriceAlertSchema>;
export type UpdatePriceAlertInput = z.infer<typeof UpdatePriceAlertSchema>;
export type CreateSubscriptionInput = z.infer<typeof CreateSubscriptionSchema>;
export type CreateAdminUserInput = z.infer<typeof CreateAdminUserSchema>;
export type UpdateAdminUserInput = z.infer<typeof UpdateAdminUserSchema>;
export type CreateMarketInput = z.infer<typeof CreateMarketSchema>;
export type UpdateMarketInput = z.infer<typeof UpdateMarketSchema>;
export type CreateSubscriptionPlanInput = z.infer<typeof CreateSubscriptionPlanSchema>;
export type UpdateSubscriptionPlanInput = z.infer<typeof UpdateSubscriptionPlanSchema>;
export type CreateDiscountCodeInput = z.infer<typeof CreateDiscountCodeSchema>;
export type UpdateDiscountCodeInput = z.infer<typeof UpdateDiscountCodeSchema>;
