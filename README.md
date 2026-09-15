# OneSpace — Role-Based E-Commerce Platform

A full-stack e-commerce management platform with three distinct roles — **Admin**,
**Shop Manager**, and **Customer** — each with their own permissions and dashboard.
Built with **NestJS**, **PostgreSQL**, and **TypeORM** on the backend, and **Next.js**,
**Tailwind CSS**, and **Zod** on the frontend.

---

## Table of contents

- [Features](#features)
- [Screenshots](#screenshots)
- [Tech stack](#tech-stack)
- [Architecture](#architecture)
- [Project structure](#project-structure)
- [Getting started](#getting-started)
- [Demo accounts](#demo-accounts)
- [Environment variables](#environment-variables)
- [API overview](#api-overview)
- [Security](#security)
- [Known limitations](#known-limitations)

---

## Features

### 👑 Admin
- Manage users (view, change role, activate/deactivate, delete)
- Manage products — full CRUD, image gallery (upload or URL), size/color variants
- Manage categories (full CRUD)
- Manage orders — view all, update fulfillment status, verify payment status
- Manage inventory — adjust stock, view movement logs, low-stock report + email alerts
- Manage coupons — percentage or fixed discounts, usage limits, expiry dates
- View sales & revenue dashboard, export orders and sales reports as CSV
- Review the activity log — an audit trail of admin/manager actions
- Create and manage staff (Manager/Admin) accounts

### 🧑‍💼 Shop Manager
- Manage products — full CRUD, image gallery, variants
- Manage inventory — adjust stock, view movement logs
- Process orders — update fulfillment status, verify payments
- View sales & revenue dashboard, export CSV reports

### 🛍️ Customer
- Browse, search, and filter products by category and price
- View product image galleries, pick size/color variants, see related products
- Read and leave star-rated reviews (only for products from a delivered order)
- Add items to cart (with variant selection), adjust quantities
- Checkout with **Cash on Delivery** or **bKash / Nagad** (manual transaction ID
  verification — no card gateway required)
- Apply coupon codes at checkout
- Track order status on a visual timeline (Placed → Processing → Shipped → Delivered)
- View order history, cancel eligible orders
- Manage profile details, change password, choose light/dark/system appearance

### Account & security
- Registration and login with hashed (bcrypt) passwords
- Strong password policy enforced client- and server-side
- Email verification on signup, with a resend option
- **Google sign-in** as an alternative to email/password
- Forgot password / reset password via emailed link (1-hour expiry)
- Change password from account settings (modal, current password required)
- "Log out of all devices" — invalidates every previously issued session at once
- Rate limiting on auth endpoints to block brute-force attempts
- Secure HTTP headers (Helmet)
- Role-based route protection on both frontend and backend
- Real email delivery (order confirmations, verification, password resets, low-stock
  alerts) via SMTP, with a safe console-log fallback if not configured

### Appearance
- Light / dark / system theme, saved to the user's account so it follows them to
  any device; guests automatically match their OS setting

---

## Screenshots

### Storefront (Customer view)

**Home page** — search, category and price filters, product grid, Taka pricing:
![Storefront home page](./docs/screenshots/storefront-home.png)

**Category filter:**
![Category filter](./docs/screenshots/category-filter.png)

**Live search** — filters the grid as you type, synced with the URL:
![Search results](./docs/screenshots/search-results.png)

**Product detail** — with a submitted review and "You may also like":
![Product detail with review](./docs/screenshots/product-detail-with-review.png)

**Product detail** — before any reviews exist:
![Product detail, no reviews yet](./docs/screenshots/product-detail-no-review.png)

**Cart:**
![Cart page](./docs/screenshots/cart.png)

**Checkout** — payment method (COD / bKash / Nagad) and coupon code:
![Checkout page](./docs/screenshots/checkout.png)

**Order history** — status timeline, payment method/status, coupon discount, and
cancel option:
![My orders](./docs/screenshots/my-orders.png)

**Profile** — light mode, with the email verification banner:
![Profile page, light mode](./docs/screenshots/profile-light.png)

**Profile** — dark mode:
![Profile page, dark mode](./docs/screenshots/profile-dark.png)

**Change password** — modal with current/new/confirm password:
![Change password modal](./docs/screenshots/change-password-modal.png)

### Auth flows

**Login** — email/password or Google:
![Login page](./docs/screenshots/login.png)

**Register:**
![Register page](./docs/screenshots/register.png)

**Forgot password:**
![Forgot password page](./docs/screenshots/forgot-password.png)

### Shop Manager Dashboard

**Overview & sales** — with CSV export:
![Manager dashboard overview](./docs/screenshots/manager-dashboard-overview.png)

**Products** — full CRUD:
![Manager products page](./docs/screenshots/manager-products.png)

**Inventory** — stock adjustment and low-stock alerts:
![Manager inventory page](./docs/screenshots/manager-inventory.png)

**Orders** — process fulfillment and verify payments:
![Manager orders page](./docs/screenshots/manager-orders.png)

**My account** — a manager's own profile settings:
![Manager profile](./docs/screenshots/manager-profile.png)

### Admin Dashboard

Admin sees everything Shop Manager sees, plus Categories, Coupons, Customers &
Staff, Staff Roles, and the Activity log:

**Overview & sales:**
![Admin dashboard overview](./docs/screenshots/admin-dashboard-overview.png)

**Products:**
![Admin products page](./docs/screenshots/admin-products.png)

**Categories:**
![Admin categories page](./docs/screenshots/admin-categories.png)

**Inventory:**
![Admin inventory page](./docs/screenshots/admin-inventory.png)

**Orders** — with payment status and CSV export:
![Admin orders page](./docs/screenshots/admin-orders.png)

**Coupons:**
![Coupons page](./docs/screenshots/coupons.png)

**Customers & staff** — manage every account and its role:
![Customers and staff page](./docs/screenshots/customers-staff.png)

**Staff roles** — create new Admin/Manager accounts:
![Staff roles page](./docs/screenshots/staff-roles.png)

**Activity log** — audit trail of admin/manager actions:
![Activity log page](./docs/screenshots/activity-log.png)

**My account** — dark mode:
![Admin profile, dark mode](./docs/screenshots/admin-profile-dark.png)

---

## Tech stack

| Layer | Technology |
|---|---|
| Backend framework | [NestJS](https://nestjs.com/) (Node.js / TypeScript) |
| Database | PostgreSQL |
| ORM | TypeORM |
| Auth | JWT (`@nestjs/jwt`, `passport-jwt`), Google OAuth (`passport-google-oauth20`), bcrypt password hashing |
| Rate limiting | `@nestjs/throttler` |
| Security headers | `helmet` |
| File uploads | `multer` |
| Email | `nodemailer` (SMTP), with console-log fallback for local dev |
| Frontend framework | [Next.js](https://nextjs.org/) 14 (App Router) |
| Styling | Tailwind CSS, with CSS-variable-driven light/dark theming |
| Forms & validation | `react-hook-form` + `zod` |
| HTTP client | `axios` |

---

## Architecture

Both the backend and frontend are organized in an explicit **Model / View / Controller**
layout rather than the framework's usual co-located structure, for clarity:

```
backend/
  src/
    models/        Model      -> TypeORM entities (User, Product, Order, Review, Coupon, ...)
    dto/                      -> request validation shapes
    controllers/   Controller -> route handlers
    services/                 -> business logic
    modules/                  -> wires model + controller + service per feature
    guards/ decorators/       -> JWT auth guard, RolesGuard, @Roles(), @CurrentUser()
    config/                   -> TypeORM + Multer configuration

frontend/
  src/
    models/        Model      -> TypeScript types + Zod schemas
    controllers/   Controller -> API service functions, AuthProvider, ThemeProvider
    views/         View       -> full page UI implementations
    components/               -> shared UI atoms (Button, Modal, RoleGuard, OrderTimeline, ...)
  app/                        -> Next.js routes; each route renders its matching View
```

### Entity relationship diagram

Generated directly from the live database schema (pgAdmin's ERD Tool). Regenerate this
after pulling the latest code, since new tables (`reviews`, `coupons`, `activity_logs`)
and columns (payment fields on `orders`, theme/verification fields on `users`) have
been added since this diagram was captured:

![Database ER diagram](./docs/screenshots/database-erd.png)

Every table uses a UUID primary key and real foreign key constraints enforced by
PostgreSQL (not just application-level references):

| Table | Foreign keys |
|---|---|
| `products` | `categoryId` → `categories.id` |
| `orders` | `userId` → `users.id` |
| `order_items` | `orderId` → `orders.id`, `productId` → `products.id` |
| `cart_items` | `userId` → `users.id`, `productId` → `products.id` |
| `inventory_logs` | `productId` → `products.id` |
| `reviews` | `productId` → `products.id`, `userId` → `users.id` |

---

## Project structure

```
shopmvc-project/
├── backend/     NestJS API (port 4000)
├── frontend/    Next.js app (port 3000)
└── docs/
    └── screenshots/   Images used in this README
```

---

## Getting started

### Prerequisites
- Node.js 18+
- PostgreSQL running locally (or a connection string to a remote instance)

### 1. Backend

```bash
cd backend
cp .env.example .env      # then fill in the values described below
npm install
npm run seed               # creates demo accounts, sample products, and a demo coupon
npm run start:dev          # http://localhost:4000/api
```

`synchronize: true` auto-creates and updates tables in dev as entities change — no
manual migrations needed locally.

### 2. Frontend

```bash
cd frontend
cp .env.local.example .env.local   # NEXT_PUBLIC_API_URL should point at the backend above
npm install
npm run dev                        # http://localhost:3000
```

Both servers need to be running at the same time, in separate terminals.

---

## Demo accounts

Created by `npm run seed` (all pre-verified, no email step needed):

| Role | Email | Password |
|---|---|---|
| Admin | `admin@shopmvc.test` | `Password123!` |
| Shop Manager | `manager@shopmvc.test` | `Password123!` |
| Customer | `customer@shopmvc.test` | `Password123!` |

A demo coupon `WELCOME10` (10% off) is also seeded for testing checkout.

---

## Environment variables

### `backend/.env`
```
PORT=4000

DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_NAME=shopmvc

JWT_SECRET=use_a_long_random_string_here
JWT_EXPIRES_IN=7d

CLIENT_URL=http://localhost:3000

# Optional - real email delivery. Leave blank to fall back to console logging.
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=
MAIL_PASSWORD=
MAIL_FROM="OneSpace <no-reply@onespace.test>"

# Optional - required only for "Continue with Google" login.
# Create credentials at https://console.cloud.google.com/apis/credentials
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=http://localhost:4000/api/auth/google/callback
```

**Never commit a real `.env` file** — `JWT_SECRET` signs every login session, and a
weak or leaked value undermines the whole auth system.

### `frontend/.env.local`
```
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

---

## API overview

Base path: `/api`. Protected routes require `Authorization: Bearer <token>` from
`/auth/login`, `/auth/register`, or the Google OAuth callback.

| Area | Endpoint | Access |
|---|---|---|
| Auth | `POST /auth/register`, `POST /auth/login` | Public |
| | `GET /auth/google`, `GET /auth/google/callback` | Public |
| | `GET /auth/verify-email`, `POST /auth/resend-verification` | Public / logged-in |
| | `POST /auth/forgot-password`, `POST /auth/reset-password` | Public |
| | `POST /auth/logout-all` | Any logged-in user |
| | `POST /auth/staff` | Admin |
| Users | `GET /users`, `PATCH /users/:id/role` | Admin |
| | `GET/PATCH /users/me/profile`, `PATCH /users/me/password`, `PATCH /users/me/theme` | Any logged-in user |
| Products | `GET /products` (search/filter/paginate), `GET /products/:id/related` | Public |
| | `POST/PATCH/DELETE /products/:id`, `POST /products/upload-image` | Admin, Manager |
| Reviews | `GET /products/:id/reviews`, `GET /products/:id/reviews/summary` | Public |
| | `POST /products/:id/reviews` | Customer (delivered order required) |
| Categories | `GET /categories` | Public |
| | `POST/PATCH/DELETE /categories/:id` | Admin |
| Coupons | `POST/PATCH/DELETE /coupons/:id`, `GET /coupons` | Admin |
| Inventory | `POST /inventory/adjust`, `GET /inventory/logs`, `GET /inventory/low-stock` | Admin, Manager |
| Cart | `GET/POST/PATCH/DELETE /cart` | Customer |
| Orders | `POST /orders/checkout`, `GET /orders/mine`, `PATCH /orders/:id/cancel` | Customer |
| | `GET /orders`, `PATCH /orders/:id/status`, `PATCH /orders/:id/payment-status` | Admin, Manager |
| | `GET /orders/export/csv` | Admin, Manager |
| Sales | `GET /sales/summary`, `GET /sales/top-products`, `GET /sales/revenue-by-day` | Admin, Manager |
| | `GET /sales/export/csv` | Admin, Manager |
| Activity log | `GET /activity-logs` | Admin |

---

## Security

- Passwords hashed with **bcrypt** (10 rounds), never stored or returned in plain text
- Strong password policy: 8+ characters, upper + lower case, and a number
- **JWT** access tokens (7-day expiry), verified on every protected request against a
  secret loaded asynchronously from `.env` (avoids a class of "secret loaded before
  config is ready" bugs common in NestJS apps)
- **Token versioning** — "log out of all devices" invalidates every previously issued
  token immediately, without needing a server-side token blacklist
- **Role-based guards** on the backend (`RolesGuard`) as the source of truth —
  the frontend's route guard is a UX convenience only, not the security boundary
- **Rate limiting** on login, register, password-reset, and email-verification
  endpoints to blunt brute-force and email-bombing attempts
- **Helmet** secure HTTP headers
- Password reset tokens are single-use, expire after 1 hour, and the
  forgot-password endpoint always returns the same response whether or not the
  email exists, to prevent account enumeration
- Google-authenticated accounts have no local password on file; attempting to
  change a password on such an account is rejected with a clear message

---

## Known limitations

- **Payments are manual, not a live gateway.** bKash/Nagad checkout collects a
  transaction ID for staff to verify by hand against their own merchant dashboard —
  there's no merchant API integration. This is the standard low-cost pattern for
  small shops without a payment aggregator contract, but it means payment
  confirmation isn't instant.
- **Product variants track a single stock count**, not per-combination inventory
  (e.g. a T-shirt in "Size: M, Color: Black" shares stock with every other size/color
  of the same product). Sufficient for small catalogs; a larger store would want a
  proper variant-stock table.
- **Email delivery falls back to console logging** if SMTP credentials aren't set in
  `.env` — fine for local development, but real users won't receive anything until
  `MAIL_USER`/`MAIL_PASSWORD` are configured.
- **Google OAuth requires your own credentials.** The code is fully wired up, but
  you must create a Google Cloud project and OAuth client to use it (see the
  `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` setup above).
- **No automated test suite yet.** All flows have been manually verified; adding
  unit tests (Jest) for services and a few end-to-end tests for auth/checkout would
  be the next investment for long-term maintainability.
- **Runs on localhost only.** Deploying the frontend (e.g. Vercel) and backend +
  database (e.g. Railway/Render) would be needed for a publicly shareable link.
