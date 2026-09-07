# ShopMVC Frontend (Next.js + Tailwind + Axios + Zod)

Role-based storefront and dashboard for **Admin**, **Shop Manager**, and **Customer**,
organized in an explicit MVC-style layout:

```
src/
  models/        Model      -> TypeScript types (types.ts) + Zod validation schemas (schemas.ts)
  controllers/   Controller -> API service functions per resource + AuthProvider/useAuth hook
  views/         View       -> full page UI implementations, one per screen
  components/               -> shared UI atoms (Button, Input, Card, Modal, RoleGuard, ...)
  lib/                      -> axios client with auth header injection, formatting helpers
app/                        -> Next.js App Router routes; each route is a thin wrapper that
                                renders the matching View (keeps routing separate from UI logic)
```

## 1. Setup

```bash
cd frontend
cp .env.local.example .env.local   # point NEXT_PUBLIC_API_URL at your backend
npm install
```

Make sure the backend (see `../backend`) is running first — the frontend expects it at
`http://localhost:4000/api` by default.

## 2. Run

```bash
npm run dev     # http://localhost:3000
```

## 3. Pages & role access

| Route                     | Who can access it            | What it does |
|---------------------------|-------------------------------|--------------|
| `/`                       | everyone                      | Browse, search, filter products |
| `/products/[id]`          | everyone                      | Product detail, add to cart |
| `/login`, `/register`     | guests                        | Auth |
| `/cart`                   | customer                      | View/edit cart |
| `/checkout`               | customer                      | Place an order |
| `/orders`                 | customer                      | Order history, cancel order |
| `/profile`                | customer                      | Manage profile |
| `/dashboard`              | admin, manager                | Sales overview |
| `/dashboard/products`     | admin, manager                | Product CRUD |
| `/dashboard/categories`   | admin only                    | Category CRUD |
| `/dashboard/inventory`    | admin, manager                | Adjust stock, view logs, low-stock report |
| `/dashboard/orders`       | admin, manager                | Process orders, update status |
| `/dashboard/users`        | admin only                    | Manage all accounts + roles |
| `/dashboard/staff`        | admin only                    | Create manager/admin accounts |

`RoleGuard` (in `src/components`) enforces this on the client by checking the logged-in
user's role from `useAuth()` and redirecting if they don't have access. Combined with the
backend's own `@Roles()` guards, this gives you both a good UX (hide/redirect) and real
enforcement (the API rejects unauthorized requests either way).

## 4. Design system

Tailwind tokens live in `tailwind.config.ts`: a pine-green / copper palette on a soft
sage-paper background, with **Fraunces** for headings/product names and **Manrope** for
UI and data. Requires internet access at build time to fetch these from Google Fonts
(`next/font/google`) — swap for local fonts if you need a fully offline build.
