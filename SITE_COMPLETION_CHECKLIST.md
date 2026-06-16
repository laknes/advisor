# Site Completion Checklist

Updated: 2026-06-16

## Status Summary

- Overall application: Complete for database-backed MVP
- Demo/mock page data: Removed from active app pages
- Build status: Passing
- TypeScript status: Passing
- Remaining blockers: production database migration, real payment credentials, real market-data provider URLs, email/SMS provider credentials

## Public Site

- [x] Localized app routes under `/[lang]`
- [x] Home page uses database/API data for markets, prices, analyses, pricing, and public settings
- [x] Markets list uses `/api/markets`
- [x] Market detail uses `/api/markets/[slug]`
- [x] Pricing page uses `/api/subscription-plans` and `/api/subscriptions`
- [x] Terms, privacy, disclaimer, FAQ pages exist
- [x] Header/footer/navigation exist
- [x] Empty states exist for database-empty screens

## Authentication

- [x] Signup page
- [x] Login page
- [x] JWT creation and verification
- [x] Password hashing with bcrypt
- [x] `/api/auth?action=register`
- [x] `/api/auth?action=login`
- [x] Client-side token storage helper
- [x] Protected user API routes
- [x] Protected admin API routes by admin email allowlist
- [ ] Password reset email flow: requires email provider setup
- [ ] Two-factor authentication: requires authenticator/SMS/email provider decision

## User Dashboard

- [x] Dashboard overview reads portfolio, subscriptions, alerts, analyses, and market prices from APIs
- [x] Portfolio page reads real portfolio data from `/api/portfolio`
- [x] Portfolio page can add positions through `/api/portfolio`
- [x] Watchlist page reads `/api/watchlist`
- [x] Watchlist page removes items through `/api/watchlist/[id]`
- [x] Analyses page reads `/api/analyses`
- [x] Alerts page reads, deactivates, and deletes alerts through `/api/alerts`
- [x] Profile page reads and updates `/api/users/profile`
- [x] Subscriptions page reads and cancels subscriptions

## Admin Dashboard

- [x] Admin dashboard reads live stats from `/api/admin/stats`
- [x] Admin user list, create, edit, delete flows
- [x] Admin analyses list, create, edit, delete flows
- [x] Admin pricing reads plans from database
- [x] Admin subscriptions reads `/api/admin/subscriptions`
- [x] Admin discounts reads/deletes `/api/admin/discounts`
- [x] Admin reports reads `/api/admin/reports`
- [x] Admin settings page exists at `/[lang]/admin/settings`
- [x] Admin integration status panel for payments and market data
- [x] Manual market-data sync action on admin dashboard

## Site Settings

- [x] `SiteSetting` Prisma model
- [x] Public settings API: `/api/settings`
- [x] Admin settings API: `/api/admin/settings`
- [x] Editable content settings: hero, SEO, support, signup, currency
- [x] Editable payment settings
- [x] Editable market-data API settings
- [x] Password-style fields for secret/API-key settings
- [ ] Apply migration on production database: `site_settings` table must exist

## Payments

- [x] Settings for Zarinpal
- [x] Settings for Zibal
- [x] Settings for IDPay
- [x] Settings for Pay.ir
- [x] Default gateway setting
- [x] Callback URL setting
- [x] Admin dashboard status for gateway configured/enabled state
- [ ] Real payment request/verify service implementation: needs selected gateway contract and merchant credentials
- [ ] Webhook/callback transaction finalization: needs production callback URL and gateway account

## Market Data

- [x] Settings for TSETMC / Tehran market API URL and key
- [x] Settings for Forex API URL and key
- [x] Settings for Gold API URL and key
- [x] Settings for Currency API URL and key
- [x] Settings for Crypto API URL and key
- [x] Market-data integration status API
- [x] Manual sync API: `/api/admin/market-data/sync`
- [x] Sync stores incoming prices in `prices`
- [x] Public pages read latest saved prices from database
- [ ] Automatic scheduler/cron: deploy platform must call sync endpoint on interval
- [ ] Real provider response mapping may need adjustment after final API provider is chosen

## APIs

- [x] Auth API
- [x] User profile API
- [x] Markets API
- [x] Analyses API
- [x] Portfolio API
- [x] Watchlist API
- [x] Alerts API
- [x] Subscription plans API
- [x] Subscriptions API
- [x] Admin users API
- [x] Admin discounts API
- [x] Admin reports API
- [x] Admin stats API
- [x] Admin settings API
- [x] Admin subscriptions API
- [x] Admin integration status API
- [x] Admin market-data sync API

## Database

- [x] Prisma schema for users, markets, analyses, prices, portfolios, subscriptions, alerts, watchlist, discounts, transactions, settings
- [x] Prisma client generation passes
- [x] Migration SQL added for `site_settings`
- [ ] Production database migration still needs to be applied

## Verification

- [x] `npx prisma generate`
- [x] `npx tsc --noEmit`
- [x] `npm run build`
- [ ] Browser smoke test: dev server approval timed out in this environment

