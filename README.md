# Multi-Store & Multi-Service Marketplace Platform

A production-grade marketplace platform built with Next.js, TypeScript, and Instant DB.

## Features

- **Multi-Role System**: Support for customers, sellers, and admin users
- **Store Management**: Sellers can create and manage stores
- **Product & Service Listings**: Support for both products (with variants) and services
- **Subscription Plans**: Three-tier subscription system (Basic, Standard, Premium)
- **Order Management**: Complete order and booking system
- **Admin Panel**: Store approval, analytics, and platform management
- **Real-time Data**: Powered by Instant DB for instant synchronization

## Tech Stack

- **Frontend**: Next.js 14+ (App Router), TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Instant DB (real-time database)
- **Authentication**: JWT tokens with magic code flow
- **Validation**: Zod schemas

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Instant DB account (get your APP_ID from https://instantdb.com/dash)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ali_project
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your Instant DB APP_ID:
```
NEXT_PUBLIC_INSTANT_APP_ID=your_instant_app_id_here
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
```

4. Initialize subscription plans (run this once):
You'll need to call the subscription service initialization method. This can be done via a setup script or admin panel.

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
ali_project/
├── app/                      # Next.js App Router
│   ├── (auth)/              # Auth pages
│   ├── (seller)/            # Seller dashboard
│   ├── (admin)/             # Admin panel
│   ├── (public)/            # Public pages
│   └── api/                 # API routes
├── lib/
│   ├── instant/             # Instant DB configuration
│   ├── auth/                # Authentication & authorization
│   ├── services/            # Business logic layer
│   ├── validators/          # Zod validation schemas
│   └── utils/               # Utilities & helpers
├── types/                   # TypeScript type definitions
└── components/              # React components
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Request magic code
- `POST /api/auth/verify-code` - Verify code and get token
- `GET /api/auth/me` - Get current user profile

### Sellers
- `POST /api/sellers/onboard` - Complete seller onboarding
- `GET /api/sellers/profile` - Get seller profile
- `PUT /api/sellers/subscription` - Update subscription
- `GET /api/sellers/analytics` - Get seller analytics

### Stores
- `GET /api/stores/search` - Search stores
- `GET /api/stores/:id` - Get store details
- `PUT /api/stores/:id` - Update store (seller only)

### Products
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `GET /api/products/store/:storeId` - Get store products

### Services
- `POST /api/services` - Create service
- `PUT /api/services/:id` - Update service
- `DELETE /api/services/:id` - Delete service
- `GET /api/services/store/:storeId` - Get store services

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders/seller` - Get seller orders
- `GET /api/orders/customer` - Get customer orders
- `PUT /api/orders/:id/status` - Update order status

### Admin
- `GET /api/admin/stores/pending` - Get pending stores
- `POST /api/admin/stores/:id/approve` - Approve/reject store
- `GET /api/admin/sellers` - Get all sellers
- `GET /api/admin/analytics` - Get platform analytics
- `PUT /api/admin/subscription-plans/:id` - Update subscription plan

## Authentication

The platform uses JWT tokens for authentication. After registration/login, users receive a magic code via email (handled by Instant DB). Once verified, a JWT token is issued and should be included in subsequent requests:

```
Authorization: Bearer <token>
```

## Subscription Plans

Three subscription tiers are available:

- **Basic** (Free): Up to 10 products, 5 services
- **Standard** (₹999/month): Up to 100 products, 50 services, analytics
- **Premium** (₹2499/month): Unlimited products/services, advanced features

## Development

### Running Tests
```bash
npm test
```

### Building for Production
```bash
npm run build
npm start
```

## License

[Your License Here]

## Contributing

[Contributing guidelines]
