# Portfolio Advisor - Backend API Documentation

## 🚀 Base URL

```
http://localhost:3000/api
```

## 🔐 Authentication

All protected endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <JWT_TOKEN>
```

---

## 📚 API Endpoints

### 🔑 Authentication

#### Register
**POST** `/auth?action=register`

```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "country": "United States"
}
```

**Response**: `{ user, token }`

---

#### Login
**POST** `/auth?action=login`

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response**: `{ user, token }`

---

### 👤 Users

#### Get Profile
**GET** `/users/profile`

**Auth**: Required ✅

**Response**: `{ user }`

---

#### Update Profile
**PUT** `/users/profile`

**Auth**: Required ✅

```json
{
  "name": "Jane Doe",
  "phone": "+1-555-1234",
  "country": "Canada",
  "avatar": "https://..."
}
```

**Response**: `{ user }`

---

### 📊 Markets

#### Get All Markets
**GET** `/markets`

**Response**: `{ markets }`

---

#### Get Market by Slug
**GET** `/markets/:slug`

Example: `/markets/iran-stocks`

**Response**: `{ market }`

---

### 📈 Analyses

#### Get Analyses
**GET** `/analyses`

**Query Parameters**:
- `marketId` - Filter by market
- `timeframe` - daily, weekly, monthly, 3month, 1year, 3year
- `type` - short_term or long_term
- `limit` - Number of results (default: 20)
- `offset` - Pagination offset (default: 0)

**Response**: `{ analyses, total, limit, offset }`

---

#### Create Analysis
**POST** `/analyses`

**Auth**: Required ✅

```json
{
  "marketId": "market-id",
  "title": "Market Analysis",
  "summary": "Summary of analysis",
  "fullContent": "Full detailed analysis content",
  "timeframe": "daily",
  "analysisType": "short_term",
  "signal": "BUY",
  "riskLevel": "MEDIUM",
  "targetPrice": 2100,
  "entryPrice": 1900,
  "stopLoss": 1850,
  "takeProfit": 2300,
  "accuracy": 78.5,
  "requiredSubscription": "daily"
}
```

**Response**: `{ analysis }`

---

#### Get Analysis by ID
**GET** `/analyses/:id`

**Response**: `{ analysis }` (full or partial based on subscription)

---

### 💼 Portfolio

#### Get Portfolio
**GET** `/portfolio`

**Auth**: Required ✅

**Response**: `{ portfolio }`

---

#### Add Position
**POST** `/portfolio`

**Auth**: Required ✅

```json
{
  "symbol": "TEPIX",
  "quantity": 100,
  "entryPrice": 1850,
  "type": "stock"
}
```

**Response**: `{ position }`

---

#### Update Position
**PUT** `/portfolio/:id`

**Auth**: Required ✅

```json
{
  "quantity": 150,
  "currentPrice": 1900
}
```

**Response**: `{ position }`

---

#### Delete Position
**DELETE** `/portfolio/:id`

**Auth**: Required ✅

**Response**: `{ success: true }`

---

### 💳 Subscriptions

#### Get All Plans
**GET** `/subscriptions`

**Response**: `{ plans }`

---

#### Get User Subscriptions
**GET** `/subscriptions?action=list`

**Auth**: Required ✅

**Response**: `{ subscriptions }`

---

#### Create Subscription
**POST** `/subscriptions`

**Auth**: Required ✅

```json
{
  "planId": "plan-id",
  "marketId": "market-id" // optional
}
```

**Response**: `{ subscription }`

---

#### Cancel Subscription
**DELETE** `/subscriptions/:id`

**Auth**: Required ✅

**Response**: `{ subscription }`

---

### 👁️ Watchlist

#### Get Watchlist
**GET** `/watchlist`

**Auth**: Required ✅

**Response**: `{ watchlist }`

---

#### Add to Watchlist
**POST** `/watchlist`

**Auth**: Required ✅

```json
{
  "symbol": "TEPIX",
  "marketId": "market-id"
}
```

**Response**: `{ item }`

---

#### Remove from Watchlist
**DELETE** `/watchlist/:id`

**Auth**: Required ✅

**Response**: `{ success: true }`

---

### 🚨 Alerts

#### Get Alerts
**GET** `/alerts`

**Auth**: Required ✅

**Response**: `{ alerts }`

---

#### Create Alert
**POST** `/alerts`

**Auth**: Required ✅

```json
{
  "symbol": "TEPIX",
  "price": 2000,
  "type": "above",
  "enabled": true
}
```

**Response**: `{ alert }`

---

#### Update Alert
**PUT** `/alerts/:id`

**Auth**: Required ✅

```json
{
  "price": 2100,
  "type": "above",
  "enabled": true
}
```

**Response**: `{ alert }`

---

#### Delete Alert
**DELETE** `/alerts/:id`

**Auth**: Required ✅

**Response**: `{ success: true }`

---

## 🔄 Response Format

### Success Response

```json
{
  "success": true,
  "data": { /* ... */ },
  "message": "Operation completed successfully"
}
```

### Error Response

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "errors": { /* validation errors */ }
}
```

### HTTP Status Codes

- `200` - OK
- `201` - Created
- `400` - Bad Request / Validation Error
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

---

## 📝 Validation Rules

### Email
- Must be valid email format

### Password
- Minimum 8 characters

### Name
- Minimum 2 characters

### Prices
- Must be positive numbers

### Symbols
- Must not be empty

---

## 🔐 Security

- All passwords are hashed with bcryptjs
- JWT tokens expire after 7 days
- Authorization is checked on all protected endpoints
- Input validation using Zod schemas

---

## 💾 Database Schema

### User
- `id` - Unique identifier
- `email` - User email (unique)
- `password` - Hashed password
- `name` - Full name
- `avatar` - Profile picture URL
- `phone` - Phone number
- `country` - Country
- `verified` - Email verification status
- `createdAt` - Account creation date
- `updatedAt` - Last update date

### Market
- `id` - Unique identifier
- `name` - Market name
- `slug` - URL slug
- `symbol` - Market symbol
- `icon` - Market emoji/icon
- `description` - Market description

### Analysis
- `id` - Unique identifier
- `marketId` - Related market
- `title` - Analysis title
- `summary` - Summary text
- `fullContent` - Full analysis content
- `timeframe` - Trading timeframe
- `analysisType` - Type (short_term/long_term)
- `signal` - Trading signal (BUY/SELL/HOLD)
- `riskLevel` - Risk level (LOW/MEDIUM/HIGH)
- `targetPrice` - Price target
- `entryPrice` - Entry price
- `stopLoss` - Stop loss price
- `takeProfit` - Take profit price
- `accuracy` - Historical accuracy percentage
- `isLocked` - Requires subscription
- `requiredSubscription` - Required plan
- `publishedAt` - Publication date
- `expiresAt` - Expiration date

### Portfolio
- `id` - Unique identifier
- `userId` - Portfolio owner
- `totalInvested` - Total amount invested
- `totalValue` - Current portfolio value
- `totalReturn` - Total return
- `returnPercentage` - Return percentage

### Position
- `id` - Unique identifier
- `portfolioId` - Related portfolio
- `symbol` - Asset symbol
- `quantity` - Number of shares/units
- `entryPrice` - Entry price
- `currentPrice` - Current price
- `totalCost` - Total cost
- `currentValue` - Current value
- `profitLoss` - Profit/loss amount
- `profitLossPercent` - Profit/loss percentage
- `type` - Asset type

### Subscription
- `id` - Unique identifier
- `userId` - Subscriber
- `planId` - Subscription plan
- `marketId` - Specific market (optional)
- `startDate` - Start date
- `endDate` - End date
- `isActive` - Active status
- `autoRenew` - Auto-renewal enabled

### SubscriptionPlan
- `id` - Unique identifier
- `name` - Plan name
- `slug` - URL slug
- `description` - Plan description
- `type` - Plan type
- `price` - Monthly/quarterly/yearly price
- `currency` - Currency code
- `billingPeriod` - Billing period
- `features` - List of features
- `isActive` - Active status

### Watchlist
- `id` - Unique identifier
- `userId` - Watchlist owner
- `symbol` - Asset symbol
- `marketId` - Related market
- `createdAt` - Creation date

### PriceAlert
- `id` - Unique identifier
- `userId` - Alert owner
- `symbol` - Asset symbol
- `targetPrice` - Alert price
- `alertType` - Alert type (above/below)
- `isActive` - Active status
- `createdAt` - Creation date

---

## 🛠️ Development

### Setup

```bash
npm install
npm run prisma:migrate
npm run dev
```

### Environment Variables

```
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
NEXTAUTH_SECRET=your-secret
NODE_ENV=development
```

### Prisma Commands

```bash
npm run prisma:generate   # Generate Prisma client
npm run prisma:migrate    # Run migrations
npm run prisma:push       # Push schema to database
npm run prisma:studio     # Open Prisma Studio
```

---

## 📊 Example Requests

### Register

```bash
curl -X POST http://localhost:3000/api/auth?action=register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "name": "John Doe"
  }'
```

### Login

```bash
curl -X POST http://localhost:3000/api/auth?action=login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### Get Profile

```bash
curl -X GET http://localhost:3000/api/users/profile \
  -H "Authorization: Bearer <TOKEN>"
```

### Create Analysis

```bash
curl -X POST http://localhost:3000/api/analyses \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "marketId": "market-id",
    "title": "Market Analysis",
    "summary": "Summary text",
    "fullContent": "Full content",
    "timeframe": "daily",
    "analysisType": "short_term",
    "signal": "BUY",
    "riskLevel": "MEDIUM"
  }'
```

---

## 🚀 Production Deployment

1. Set up PostgreSQL database
2. Configure environment variables
3. Run migrations: `npm run prisma:migrate`
4. Build project: `npm run build`
5. Start server: `npm start`

---

## 📝 Notes

- All timestamps are in UTC
- Dates can be provided as ISO strings or Date objects
- Empty strings are treated as null for optional fields
- Case-sensitive for enums (BUY, SELL, HOLD, etc.)

---

**Generated**: 2026-06-07  
**Version**: 1.0.0
