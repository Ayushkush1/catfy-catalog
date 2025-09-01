# Catfy - Digital Catalogue Platform

A modern, full-stack digital catalogue platform built with Next.js, TypeScript, and Supabase. Create, manage, and share beautiful product catalogues with advanced customization, smart sorting, and PDF export capabilities.

## Features

### Core Features
- 🏪 **Multi-tenant Catalogue Management** - Create and manage multiple product catalogues with unlimited products
- 📱 **Responsive Design** - Works seamlessly on desktop, tablet, and mobile devices
- 🎨 **Advanced Theme Customization** - Multiple pre-built themes with extensive customization options
- 🧠 **Smart Product Sorting** - AI-powered product sorting with priority tags (bestseller, trending, seasonal, new, featured)
- 📄 **PDF Export** - Generate high-quality PDF catalogues using Playwright with custom styling
- 🖼️ **Advanced Image Management** - Upload, resize, optimize, and manage product images with cloud storage
- 🏷️ **Coupon System** - Create and manage discount coupons with advanced validation rules
- 💳 **Stripe Integration** - Secure payment processing for subscriptions with multiple plan tiers
- 📊 **Advanced Analytics** - Track catalogue views, exports, user engagement, and performance metrics
- 👥 **Team Collaboration** - Multi-user workspace with role-based permissions
- 🔧 **Admin Dashboard** - Comprehensive admin panel for user and platform management

### Advanced Customization
- 🎨 **Style Customizer** - Real-time visual customization with color picker, typography, and spacing controls
- 🖌️ **Font Customization** - Choose from multiple font families with size and weight controls
- 📐 **Layout Controls** - Adjust padding, margins, gaps, and spacing for perfect layouts
- 🎯 **Advanced Styling** - Border customization, shadow effects, and advanced CSS controls
- 🌈 **Color Management** - Comprehensive color customization for all UI elements

### Business Features
- 💼 **Multi-tier Subscriptions** - Free, Standard, Professional, and Business plans
- 🏢 **Business Account Support** - Enhanced features for business users
- 📈 **Usage Analytics** - Track subscription usage and limits
- 🔒 **Access Control** - Public, private, and restricted catalogue visibility options
- 📧 **Email Integration** - Automated notifications and team invitations

### Technical Features
- ⚡ **Server-Side Rendering** - Fast page loads with Next.js 14 App Router
- 🔐 **Secure Authentication** - Supabase Auth with role-based access control
- 🗄️ **Database** - PostgreSQL with Prisma ORM and optimized queries
- 🎯 **Full Type Safety** - Complete TypeScript coverage with strict typing
- 🧪 **Testing Suite** - Unit and integration tests with Vitest and React Testing Library
- 🚀 **CI/CD Pipeline** - Automated testing and deployment with GitHub Actions
- 🔄 **Real-time Updates** - Live collaboration and real-time data synchronization

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL (Supabase)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **Payments**: Stripe
- **PDF Generation**: Playwright
- **Testing**: Vitest, React Testing Library
- **Deployment**: Vercel

## Recent Updates & Improvements

### Latest Features (2024)

- **🎨 Advanced Style Customization**: Enhanced StyleCustomizer component with comprehensive theming options
- **🧠 Smart Product Sorting**: AI-powered product organization based on intelligent tag prioritization
- **👥 Enhanced Team Collaboration**: Improved team management with role-based permissions
- **📊 Admin Dashboard**: Comprehensive admin panel for user, catalogue, and subscription management
- **🎯 Multi-tier Subscriptions**: Flexible subscription plans with feature-based access control
- **📱 Modern Template System**: Modular template architecture with the new Modern 4-page template
- **🔧 Improved Navigation**: Separated Profile and Settings for better user experience
- **📈 Analytics Integration**: Enhanced tracking and reporting capabilities
- **🎨 Theme Marketplace**: Expanded theme selection with premium options
- **⚡ Performance Optimizations**: Improved loading times and user experience

### Technical Improvements

- **TypeScript Enhancement**: Improved type safety across all components
- **Component Architecture**: Modular design with reusable components
- **State Management**: Enhanced context providers and hooks
- **Database Optimization**: Improved Prisma schema and query performance
- **Security Updates**: Enhanced authentication and authorization
- **Testing Coverage**: Expanded test suite for critical features

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database (or Supabase account)
- Stripe account (for payments)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/catfy.git
   cd catfy
   ```

2. **Install dependencies**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Fill in your environment variables:
   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/catfy?schema=public"
   
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
   SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
   
   # Stripe
   STRIPE_SECRET_KEY="sk_test_..."
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
   STRIPE_WEBHOOK_SECRET="whsec_..."
   
   # App Configuration
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-nextauth-secret"
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Run migrations
   npx prisma migrate dev
   
   # Seed the database
   npm run db:seed
   ```

5. **Install Playwright browsers**
   ```bash
   npx playwright install
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
catfy/
├── src/
│   ├── app/                 # Next.js 14 app directory
│   │   ├── admin/           # Admin dashboard and management
│   │   ├── api/             # API routes and endpoints
│   │   ├── auth/            # Authentication pages
│   │   ├── billing/         # Subscription and billing management
│   │   ├── catalogue/       # Catalogue creation and editing
│   │   ├── dashboard/       # User dashboard
│   │   ├── documentation/   # Help and documentation
│   │   ├── help/            # Support pages
│   │   ├── invitations/     # Team invitation handling
│   │   ├── onboarding/      # User onboarding flow
│   │   ├── preview/         # Catalogue preview and PDF generation
│   │   ├── pricing/         # Subscription plans and pricing
│   │   ├── profile/         # User profile management
│   │   ├── settings/        # Application settings
│   │   └── themes/          # Theme selection and customization
│   ├── components/          # React components
│   │   ├── admin/           # Admin-specific components
│   │   ├── auth-provider.tsx # Authentication provider
│   │   ├── catalog/         # Catalogue-related components
│   │   ├── catalog-templates/ # Template system
│   │   │   ├── modern-4page/ # Modern 4-page template
│   │   │   │   ├── components/ # Template components
│   │   │   │   │   ├── StyleCustomizer.tsx # Advanced style customization
│   │   │   │   │   ├── ProductGrid.tsx     # Smart product grid
│   │   │   │   │   ├── CatalogCover.tsx    # Cover page component
│   │   │   │   │   └── TableOfContents.tsx # TOC component
│   │   │   │   └── types/    # Template type definitions
│   │   │   └── index.ts     # Template registry
│   │   ├── ui/              # Reusable UI components
│   │   ├── Header.tsx       # Main navigation header
│   │   ├── TeamManagement.tsx # Team collaboration
│   │   └── UpgradePrompt.tsx  # Subscription upgrade prompts
│   ├── contexts/            # React contexts
│   │   └── SubscriptionContext.tsx # Subscription state management
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Utility functions and configurations
│   │   ├── ai/              # AI integration utilities
│   │   ├── supabase/        # Supabase client configuration
│   │   ├── admin-config.ts  # Admin configuration
│   │   ├── auth.ts          # Authentication utilities
│   │   ├── client-auth.ts   # Client-side auth
│   │   ├── email.ts         # Email service integration
│   │   ├── file-utils.ts    # File handling utilities
│   │   ├── gemini.ts        # Google Gemini AI integration
│   │   ├── prisma.ts        # Database client
│   │   ├── sorting.ts       # Smart product sorting algorithms
│   │   ├── storage.ts       # File storage utilities
│   │   ├── stripe.ts        # Payment processing
│   │   ├── subscription.ts  # Subscription management
│   │   └── utils.ts         # General utilities
│   ├── types/               # TypeScript type definitions
│   └── middleware.ts        # Next.js middleware
├── prisma/                  # Database schema and migrations
│   ├── schema.prisma        # Database schema
│   ├── migrations/          # Database migrations
│   └── seed-plans.ts        # Subscription plan seeding
├── public/                  # Static assets
├── tests/                   # Test files
├── docs/                    # API and feature documentation
└── smart-sort-demo.md       # Smart sorting feature documentation
```

## API Documentation

The API provides comprehensive endpoints organized into the following categories:

### Authentication & User Management
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User authentication
- `GET /api/auth/session` - Session validation
- `PUT /api/user/profile` - Update user profile
- `GET /api/user/subscription` - Get subscription status

### Catalogue Management
- `GET /api/catalogues` - List user catalogues
- `POST /api/catalogues` - Create new catalogue
- `GET /api/catalogues/[id]` - Get catalogue details
- `PUT /api/catalogues/[id]` - Update catalogue
- `DELETE /api/catalogues/[id]` - Delete catalogue
- `POST /api/catalogues/[id]/duplicate` - Duplicate catalogue

### Product Management
- `GET /api/catalogues/[id]/products` - List catalogue products
- `POST /api/catalogues/[id]/products` - Add product to catalogue
- `PUT /api/products/[id]` - Update product details
- `DELETE /api/products/[id]` - Remove product
- `POST /api/products/[id]/upload-image` - Upload product image

### Template & Theming
- `GET /api/templates` - List available templates
- `GET /api/themes` - List available themes
- `PUT /api/catalogues/[id]/theme` - Update catalogue theme
- `POST /api/catalogues/[id]/customize` - Apply custom styling

### Team Collaboration
- `GET /api/catalogues/[id]/team` - List team members
- `POST /api/catalogues/[id]/invite` - Invite team member
- `PUT /api/team/[id]/role` - Update member role
- `DELETE /api/team/[id]` - Remove team member

### Subscription & Billing
- `GET /api/subscription/plans` - List subscription plans
- `POST /api/subscription/checkout` - Create checkout session
- `POST /api/subscription/upgrade` - Upgrade subscription
- `GET /api/billing/history` - Get billing history

### Analytics & Reporting
- `GET /api/analytics/overview` - Dashboard analytics
- `GET /api/analytics/catalogues/[id]` - Catalogue-specific metrics
- `POST /api/analytics/track` - Track user events

### Admin (Admin users only)
- `GET /api/admin/stats` - System statistics
- `GET /api/admin/users` - List all users
- `GET /api/admin/catalogues` - List all catalogues
- `PUT /api/admin/users/[id]` - Update user status

### Export & Generation
- `POST /api/catalogues/[id]/generate-pdf` - Generate PDF catalogue
- `GET /api/catalogues/[id]/preview` - Get catalogue preview
- `POST /api/catalogues/[id]/export` - Export catalogue data

### AI Features
- `POST /api/ai/generate-description` - AI product descriptions
- `POST /api/ai/smart-sort` - Smart product sorting
- `POST /api/ai/suggest-tags` - AI tag suggestions

For detailed API documentation with request/response schemas, see [docs/api.md](docs/api.md).

## Development

### Development Workflow

1. **Start the development server**
   ```bash
   npm run dev
   ```

2. **Run in development mode with database**
   ```bash
   # Start database (if using Docker)
   docker-compose up -d postgres
   
   # Run migrations
   npx prisma migrate dev
   
   # Start the app
   npm run dev
   ```

### Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint errors
npm run format           # Format code with Prettier
npm run type-check       # TypeScript type checking

# Testing
npm run test             # Run tests
npm run test:ui          # Run tests with UI
npm run test:coverage    # Run tests with coverage

# Database
npm run db:generate      # Generate Prisma client
npm run db:migrate       # Run migrations
npm run db:seed          # Seed database
npm run db:studio        # Open Prisma Studio
npm run db:reset         # Reset database
```

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

### Building for Production

```bash
# Build the application
npm run build

# Start production server
npm start

# Analyze bundle size
npm run analyze
```

### Database Management

```bash
# Reset database
npx prisma migrate reset

# Generate Prisma client
npx prisma generate

# View database in browser
npx prisma studio

# Create new migration
npx prisma migrate dev --name your_migration_name

# Deploy migrations to production
npx prisma migrate deploy

# Seed the database
npx prisma db seed
```

### Code Quality

```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Type check
npm run type-check
```

## Deployment

### Vercel (Recommended)

1. **Connect your repository to Vercel**
2. **Set environment variables** in Vercel dashboard
3. **Deploy** - Vercel will automatically build and deploy

### Manual Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Set up production database**
   ```bash
   npx prisma migrate deploy
   npx prisma db seed
   ```

3. **Start the production server**
   ```bash
   npm start
   ```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Yes |
| `STRIPE_SECRET_KEY` | Stripe secret key | Yes |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | Yes |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret | Yes |
| `NEXT_PUBLIC_APP_URL` | Application URL | Yes |
| `NEXTAUTH_SECRET` | NextAuth secret | Yes |
| `PLAYWRIGHT_HEADLESS` | Run Playwright in headless mode | No |

### Production Environment Setup

### Vercel Deployment

1. **Connect your repository to Vercel**
   - Import your project from GitHub/GitLab
   - Vercel will auto-detect Next.js configuration

2. **Configure environment variables**
   - Add all environment variables in Vercel dashboard
   - Ensure production URLs are used for production deployment

3. **Database setup**
   - Use Vercel Postgres or external PostgreSQL provider
   - Run migrations: `npx prisma migrate deploy`
   - Seed database: `npx prisma db seed`

4. **Domain configuration**
   - Add custom domain in Vercel dashboard
   - Update `NEXT_PUBLIC_APP_URL` environment variable

### Docker Deployment

```dockerfile
# Use the official Node.js image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
```

### Production Checklist

- [ ] Environment variables configured
- [ ] Database migrations deployed
- [ ] Stripe webhooks configured
- [ ] Domain and SSL certificates set up
- [ ] Analytics and monitoring enabled
- [ ] Error tracking configured (Sentry)
- [ ] Backup strategy implemented
- [ ] Performance monitoring set up

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Guidelines

- Follow TypeScript best practices
- Write tests for new features
- Use conventional commit messages
- Ensure code passes linting and formatting
- Update documentation for new features

### How to Contribute

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@catfy.com or join our [Discord community](https://discord.gg/catfy).

## Roadmap

### Upcoming Features

- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] API rate limiting
- [ ] Advanced team permissions
- [ ] Catalogue versioning
- [ ] Integration marketplace
- [ ] White-label solutions

### Performance Goals

- [ ] Sub-2s page load times
- [ ] 99.9% uptime
- [ ] Mobile-first responsive design
- [ ] Accessibility compliance (WCAG 2.1)
- [ ] SEO optimization