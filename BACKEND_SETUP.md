# Backend Setup & Configuration Guide

## 📋 Prerequisites

- Node.js >= 18.0.0
- PostgreSQL >= 14
- npm or yarn

## 🚀 Installation

### 1. Install Dependencies

```bash
npm install
```

This will install all necessary packages:
- `@prisma/client` - Database ORM
- `bcryptjs` - Password hashing
- `jsonwebtoken` - JWT authentication
- `zod` - Input validation
- `stripe` - Payment processing (optional)
- And all other required packages

### 2. Set Up Environment Variables

Create a `.env.local` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/portfolio_advisor"

# Authentication
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# JWT
JWT_SECRET="your-jwt-secret-key"
JWT_EXPIRY="7d"

# Email (Optional)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"

# Stripe (Optional)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."

# API
NEXT_PUBLIC_API_URL="http://localhost:3000/api"
NODE_ENV="development"
```

### 3. Set Up PostgreSQL Database

#### Option A: Using Local PostgreSQL

```bash
# Create database
createdb portfolio_advisor

# Update DATABASE_URL in .env.local
DATABASE_URL="postgresql://your-user:your-password@localhost:5432/portfolio_advisor"
```

#### Option B: Using Docker

```bash
docker run --name postgres-portfolio \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=portfolio_advisor \
  -p 5432:5432 \
  -d postgres:15
```

### 4. Initialize Prisma

```bash
# Generate Prisma client
npm run prisma:generate

# Create database schema
npm run prisma:push

# Open Prisma Studio (Optional)
npm run prisma:studio
```

### 5. Generate JWT Secret

```bash
# Generate a secure secret key
openssl rand -base64 32
```

Use this output for `JWT_SECRET` and `NEXTAUTH_SECRET` in `.env.local`.

## 🏃 Running the Application

### Development Mode

```bash
npm run dev
```

The application will start at `http://localhost:3000`

### Production Mode

```bash
npm run build
npm start
```

## 📚 Prisma Commands

```bash
# Generate Prisma client
npm run prisma:generate

# Create a new migration
npm run prisma:migrate

# Sync schema with database
npm run prisma:push

# Open Prisma Studio (GUI for database)
npm run prisma:studio

# Reset database (development only)
npx prisma db push --skip-generate
```

## 🗄️ Database Migration

### Create Migrations

Whenever you modify the `schema.prisma` file:

```bash
npm run prisma:migrate
```

This will:
1. Detect schema changes
2. Create a migration file
3. Apply migration to database

### Reset Database (Development)

```bash
npx prisma migrate reset
```

**Warning**: This will delete all data!

## 🔐 Generating Secrets

### For Production

```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32

# Generate JWT_SECRET
openssl rand -base64 32

# Generate STRIPE_WEBHOOK_SECRET (if using Stripe)
# Get from Stripe Dashboard
```

## 📊 Seeding Database (Optional)

Create `prisma/seed.ts`:

```typescript
import { prisma } from '@/lib/db';

async function main() {
  // Seed markets
  const markets = await prisma.market.createMany({
    data: [
      {
        name: 'Iran Stocks',
        slug: 'iran-stocks',
        symbol: 'TSE',
        icon: '📊',
        description: 'Tehran Stock Exchange',
      },
      {
        name: 'Forex',
        slug: 'forex',
        symbol: 'FX',
        icon: '💱',
        description: 'Foreign Exchange Markets',
      },
    ],
  });

  console.log('Seeded markets:', markets);
}

main()
  .catch((error) => console.error(error))
  .finally(() => prisma.$disconnect());
```

Then run:

```bash
npm run prisma:db:seed
```

## 🧪 Testing Endpoints

### Using cURL

```bash
# Register
curl -X POST http://localhost:3000/api/auth?action=register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'

# Login
curl -X POST http://localhost:3000/api/auth?action=login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Using Postman

1. Import the API endpoints
2. Set `Authorization` header to `Bearer <JWT_TOKEN>`
3. Test each endpoint

### Using Thunder Client (VS Code)

1. Install Thunder Client extension
2. Create requests for each endpoint
3. Save as collection

## 🔍 Debugging

### Enable Prisma Logging

In `src/lib/db.ts`, modify:

```typescript
new PrismaClient({
  log: ['query', 'error', 'warn'],
})
```

### View Database Queries

```bash
npm run prisma:studio
```

### Check Environment Variables

```bash
# List all environment variables
env | grep DATABASE_URL
```

## 🚨 Common Issues

### Connection Refused

```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solution**: Start PostgreSQL server

### Authentication Failed

```
Error: password authentication failed for user "postgres"
```

**Solution**: Check DATABASE_URL credentials

### Port Already in Use

```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solution**: Kill process or use different port:

```bash
PORT=3001 npm run dev
```

### Prisma Client Out of Sync

```bash
npm run prisma:generate
```

## 📦 Deployment

### Vercel

```bash
# Push code to GitHub
git push origin main

# Connect to Vercel
# Set environment variables in Vercel dashboard
# Vercel will auto-deploy
```

### Environment Variables for Vercel

Add these in Vercel Dashboard:
- `DATABASE_URL`
- `JWT_SECRET`
- `NEXTAUTH_SECRET`
- `NEXT_PUBLIC_API_URL`

### Docker Deployment

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

```bash
docker build -t portfolio-advisor .
docker run -p 3000:3000 --env-file .env.local portfolio-advisor
```

## 🔒 Security Checklist

- [ ] Set strong JWT_SECRET
- [ ] Use HTTPS in production
- [ ] Enable CORS if needed
- [ ] Validate all inputs with Zod
- [ ] Hash passwords with bcryptjs
- [ ] Use environment variables for secrets
- [ ] Set database connection pool limits
- [ ] Enable database backups
- [ ] Monitor error logs
- [ ] Rate limit API endpoints

## 📞 Support

For issues or questions:
1. Check API_DOCUMENTATION.md
2. Review error logs
3. Check Prisma documentation: https://www.prisma.io
4. Contact support team

---

**Last Updated**: 2026-06-07
