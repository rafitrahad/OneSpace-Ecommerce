# ShopMVC Backend (NestJS + TypeORM + PostgreSQL)

Role-based e-commerce API for **Admin**, **Shop Manager**, and **Customer**, organized
in an explicit MVC-style layout:

```
src/
  models/        Model      -> TypeORM entities (User, Product, Category, Order, ...)
  dto/                      -> request validation shapes (class-validator)
  controllers/   Controller -> route handlers (thin, delegate to services)
  services/                 -> business logic / "the real controller behavior"
  modules/                  -> wires model + controller + service together per feature
  guards/ decorators/       -> JWT auth guard, RolesGuard, @Roles(), @CurrentUser()
  filters/                  -> global HTTP exception formatting
  config/                   -> TypeORM datasource config
  seeds/                    -> demo data seeder
```

> Note: a REST API has no template "View" layer — the JSON returned by each
> controller is the equivalent view/response representation consumed by the frontend.

## 1. Setup

```bash
cd backend
cp .env.example .env      # then edit DB + JWT_SECRET values
npm install
```

Make sure PostgreSQL is running and the database in `.env` (`DB_NAME`) exists:

```bash
createdb shopmvc
```

## 2. Run

```bash
npm run start:dev      # dev, hot reload, http://localhost:4000/api
```

`synchronize: true` auto-creates tables in dev. Switch to migrations for production.

## 3. Seed demo data

```bash
npm run seed
```

Creates:
| Role     | Email                  | Password      |
|----------|------------------------|---------------|
| Admin    | admin@shopmvc.test     | Password123!  |
| Manager  | manager@shopmvc.test   | Password123!  |
| Customer | customer@shopmvc.test  | Password123!  |

Plus 3 categories and 4 sample products.

## 4. API summary (base path `/api`)

| Area       | Endpoint                              | Roles                    |
|------------|----------------------------------------|---------------------------|
| Auth       | `POST /auth/register`                 | public                    |
|            | `POST /auth/login`                    | public                    |
|            | `POST /auth/staff`                    | admin (create manager/admin) |
|            | `GET  /auth/me`                       | any logged-in user        |
| Users      | `GET /users`                          | admin                     |
|            | `GET/PATCH /users/me/profile`         | any logged-in user        |
|            | `PATCH /users/:id/role`               | admin                     |
|            | `PATCH /users/:id/activate|deactivate`| admin                     |
|            | `DELETE /users/:id`                   | admin                     |
| Categories | `GET /categories`                     | public                    |
|            | `POST/PATCH/DELETE /categories`       | admin                     |
| Products   | `GET /products` (search/filter/paginate) | public                 |
|            | `GET /products/staff/all`             | admin, manager            |
|            | `POST/PATCH/DELETE /products/:id`     | admin, manager            |
| Inventory  | `POST /inventory/adjust`              | admin, manager            |
|            | `GET /inventory/logs`                 | admin, manager            |
|            | `GET /inventory/low-stock`            | admin, manager            |
| Cart       | `GET/POST/PATCH/DELETE /cart`         | customer                  |
| Orders     | `POST /orders/checkout`               | customer                  |
|            | `GET /orders/mine`                    | customer                  |
|            | `GET /orders`                         | admin, manager            |
|            | `PATCH /orders/:id/status`            | admin, manager            |
|            | `PATCH /orders/:id/cancel`            | customer (own) / staff    |
| Sales      | `GET /sales/summary`                  | admin, manager            |
|            | `GET /sales/top-products`             | admin, manager            |
|            | `GET /sales/revenue-by-day`           | admin, manager            |

All protected routes require `Authorization: Bearer <accessToken>` returned from
`/auth/login` or `/auth/register`.
