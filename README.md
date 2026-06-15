# Portfolio Advisor - Professional Investment Advisory Platform

A modern, fully responsive web application for investment consulting and portfolio management. Built with Next.js, TypeScript, Tailwind CSS, and PostgreSQL.

## 🎯 Overview

Portfolio Advisor is a comprehensive investment advisory platform that helps users analyze multiple markets, manage their investment portfolios, and access expert market analysis with flexible subscription options.

### Key Features

- **Multi-Market Analysis**: Real-time tracking and analysis for Iran Stocks, Forex, Gold, and Currency markets
- **Expert Analyses**: Short-term (daily, weekly, monthly) and long-term (3-month, 1-year, 3-year) market analysis
- **Portfolio Management**: Track and manage your investment positions with real-time calculations
- **Subscription System**: Flexible subscription plans for different timeframes, individual markets, and VIP access
- **User Dashboard**: Personalized dashboard with watchlist, alerts, and saved analyses
- **Admin Panel**: Comprehensive admin tools for user management, analysis publishing, and platform analytics
- **Modern UI/UX**: White and purple professional fintech design with full responsiveness
- **Authentication**: Secure user authentication with role-based access control

## 🏗️ Project Structure

```
portfolio-advisor/
├── src/
│   ├── app/
│   │   ├── (public pages)
│   │   │   ├── page.tsx                 # Home page
│   │   │   ├── pricing/                 # Pricing page
│   │   │   ├── markets/                 # Markets listing and details
│   │   │   └── about/                   # About page
│   │   ├── auth/
│   │   │   ├── signup/                  # User registration
│   │   │   └── login/                   # User login
│   │   ├── dashboard/
│   │   │   ├── page.tsx                 # Dashboard overview
│   │   │   ├── portfolio/               # Portfolio management
│   │   │   ├── watchlist/               # Watched assets
│   │   │   ├── subscriptions/           # Subscription management
│   │   │   ├── alerts/                  # Price alerts
│   │   │   └── profile/                 # User profile
│   │   ├── admin/
│   │   │   ├── page.tsx                 # Admin dashboard
│   │   │   ├── users/                   # User management
│   │   │   ├── subscriptions/           # Subscription management
│   │   │   ├── analyses/                # Analysis management
│   │   │   ├── pricing/                 # Pricing management
│   │   │   └── reports/                 # Analytics & reports
│   │   ├── layout.tsx                   # Root layout
│   │   ├── globals.css                  # Global styles
│   │   └── page.tsx                     # Home page
│   ├── components/
│   │   ├── Button.tsx                   # Button component
│   │   ├── Card.tsx                     # Card components
│   │   ├── Badge.tsx                    # Badge & indicators
│   │   ├── Header.tsx                   # Navigation header
│   │   ├── Form.tsx                     # Form inputs
│   │   └── index.ts                     # Component exports
│   ├── lib/
│   │   ├── types.ts                     # TypeScript types
│   │   ├── utils.ts                     # Utility functions
│   │   └── mockData.ts                  # Mock data for demo
│   └── middleware.ts                    # Authentication middleware
├── prisma/
│   └── schema.prisma                    # Database schema
├── .env.local                           # Environment variables
├── tailwind.config.ts                   # Tailwind configuration
├── next.config.ts                       # Next.js configuration
├── tsconfig.json                        # TypeScript configuration
└── package.json                         # Dependencies
```

## 🛠️ Tech Stack

- **Frontend Framework**: Next.js 16+ with TypeScript
- **Styling**: Tailwind CSS v4 with custom color themes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js (ready for implementation)
- **Charts**: Recharts (ready for integration)
- **Form Handling**: React Hook Form + Zod validation
- **UI Components**: Custom React components with TypeScript
- **Icons**: Lucide React
- **Date Handling**: date-fns

## 📋 Markets Supported

1. **Iran Stocks (TSE)** - Tehran Stock Exchange
2. **Forex (FX)** - Foreign Exchange Markets
3. **Gold (XAU/USD)** - Precious Metals
4. **Currency (USD/IRR)** - Dollar & Major Currencies

## 💳 Subscription Models

### Short-term Analysis Plans
- Daily Analysis - $49/month
- Weekly Analysis - $99/month
- Monthly Analysis - $149/month

### Long-term Analysis Plans
- 3-Month Analysis - $199/quarter
- 1-Year Analysis - (Available in pricing)
- 3-Year Analysis - (Available in pricing)

### Premium Plans
- Market Full Access - $299/month (one market complete access)
- All Markets (VIP) - $599/month (all features, all markets)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- PostgreSQL database
- Git

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd advisor
```

2. **Install dependencies**
```bash
npm install
```

3. **Setup environment variables**
```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your configuration:
```
DATABASE_URL=postgresql://user:password@localhost:5432/portfolio_advisor
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here
```

4. **Setup database**
```bash
npx prisma migrate dev --name init
npx prisma db seed  # Optional: load sample data
```

5. **Run development server**
```bash
npm run dev
```

6. **Open in browser**
Visit [http://localhost:3000](http://localhost:3000)

### Production Admin

The production admin account is created by `install.bash`. During installation, enter a real admin email and password; the installer hashes the password and stores the admin user in PostgreSQL.

## 📖 Usage

### For Users

1. **Sign Up** - Create an account at `/auth/signup`
2. **Browse Markets** - Navigate to `/markets` to see available markets
3. **View Analyses** - Access detailed market analysis for each market
4. **Subscribe** - Choose a subscription plan at `/pricing`
5. **Dashboard** - Manage portfolio, watchlist, and subscriptions at `/dashboard`

### For Administrators

1. **Access Admin** - Navigate to `/admin` portal
2. **Manage Users** - View and manage user accounts and subscriptions
3. **Publish Analyses** - Create and publish market analyses
4. **View Reports** - Access platform analytics and performance metrics
5. **Configure Plans** - Manage subscription plans and pricing

## 🎨 Design System

### Color Palette

- **Primary Purple**: #b852ff (rgb(184, 82, 255))
- **Accent Colors**: Various purple shades for hierarchy
- **Neutral**: White, gray, and secondary colors for content
- **Status Colors**: Green (success), Red (danger), Amber (warning)

### Key Components

- Custom buttons with multiple variants
- Responsive card layouts
- Form components with validation
- Badge and status indicators
- Real-time price tracking displays
- Analysis cards with locked/unlocked states

## 🔐 Security Features

- User authentication with password hashing
- Role-based access control (User/Admin)
- Protected API routes with middleware
- Secure session management
- Input validation and sanitization
- CORS protection

## 📊 Database Schema

The application uses Prisma ORM with the following main entities:

- **User** - User accounts and profiles
- **Market** - Available markets (Iran Stocks, Forex, Gold, Currency)
- **Analysis** - Market analyses with timeframes and signals
- **SubscriptionPlan** - Available subscription options
- **Subscription** - Active user subscriptions
- **Portfolio** - User investment portfolios
- **Position** - Individual investment positions
- **Price** - Real-time market prices
- **Watchlist** - User watched assets
- **PriceAlert** - Automated price alerts
- **Notification** - User notifications

## 🔄 API Routes

The application includes API routes for:

- Authentication (login, registration, logout)
- Markets data (fetch markets, prices, analyses)
- User profile management
- Portfolio operations
- Subscription management
- Admin operations

## 📱 Responsive Design

- **Mobile First**: Optimized for all screen sizes
- **Breakpoints**: Tailored layouts for mobile, tablet, and desktop
- **Navigation**: Adaptive header with mobile menu
- **Tables**: Horizontal scrolling for data on mobile
- **Touch Friendly**: Appropriate button sizes and spacing

## 🧪 Development

### Build for Production

```bash
npm run build
npm start
```

### Code Quality

```bash
npm run lint          # Run ESLint
npm run type-check    # TypeScript type checking
```

### Database Migrations

```bash
npx prisma migrate dev              # Create migration
npx prisma migrate deploy           # Apply to production
npx prisma studio                   # Open Prisma GUI
```

## 📚 Key Features Implemented

### Phase 1 (Current)
- ✅ Modern responsive UI with Tailwind CSS
- ✅ Home page with market overview
- ✅ Markets listing and individual market pages
- ✅ Subscription plans showcase
- ✅ User authentication pages (signup/login)
- ✅ User dashboard with portfolio overview
- ✅ Admin panel with basic management
- ✅ Database schema with Prisma
- ✅ Component library setup

### Phase 2 (To Implement)
- Real database integration
- NextAuth.js implementation
- Payment gateway integration (Stripe)
- Email notifications
- Real-time price updates
- WebSocket integration
- Advanced charting
- API documentation

### Phase 3 (Future)
- Mobile app (React Native)
- Advanced analytics
- Machine learning for predictions
- Social features (analysis sharing)
- Backtesting tools

## 🚨 Important Notes

1. **Admin setup**: Use `install.bash` to create the production admin user and database.
2. **Payment**: Subscription system is ready for Stripe integration.
3. **Real-time Data**: Integrate with a market data provider for live quotes.
4. **Database**: Configure PostgreSQL connection in `.env.local` or `.env.production`.

## 📝 Configuration Files

### Key Files for Production

- `.env.local` - Environment variables
- `tailwind.config.ts` - Design system configuration
- `tsconfig.json` - TypeScript configuration
- `next.config.ts` - Next.js optimization settings
- `prisma/schema.prisma` - Database schema

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Ensure code quality with linting
4. Submit a pull request

## 📄 License

This project is proprietary and confidential.

## 🆘 Support & Documentation

For detailed documentation, visit the inline code comments and component documentation.

### Common Issues

**Database Connection Error**
- Check PostgreSQL is running
- Verify DATABASE_URL in .env.local
- Run `npx prisma migrate dev`

**Port 3000 in Use**
- Change port: `npm run dev -- -p 3001`
- Or kill process: `lsof -ti:3000 | xargs kill -9`

**Build Errors**
- Clear cache: `rm -rf .next`
- Reinstall: `npm install`
- Type check: `npm run lint`

## 🎓 Learning Resources

- Next.js Documentation: https://nextjs.org/docs
- Tailwind CSS: https://tailwindcss.com/docs
- Prisma ORM: https://www.prisma.io/docs
- React TypeScript: https://react-typescript-cheatsheet.netlify.app

---

**Built with ❤️ for modern investors**

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
