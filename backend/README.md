# Dukaan Backend API

Production-structured REST API for the Dukaan e-commerce platform — Node.js, Express, MongoDB (Atlas), JWT auth.

## Setup

```bash
npm install
cp .env.example .env   # then fill in MONGODB_URI at minimum
npm run seed            # optional — populates demo categories/brands/products + an admin user
npm run dev
```

API runs at `http://localhost:5000/api/v1`. Health check: `GET /api/v1/health`.

## Folder structure

```
config/         env loading, MongoDB connection
controllers/    thin HTTP handlers — parse req, call a service, shape the response
services/       business logic (auth, orders, payments, coupons...)
repositories/   MongoDB query encapsulation (Product, Order)
models/         Mongoose schemas + indexes
routes/         Express routers, wired to middleware + controllers
middleware/     auth, error handling, rate limiting, validation
validations/    per-resource input validation rules
utils/          logger, JWT helpers, pagination, API response shape, seed script
constants/      shared enums (roles, order status, payment status...)
events/         in-process event bus for order lifecycle events
jobs/           scheduled background tasks (abandoned cart reminders, etc.)
cache/          in-memory TTL cache (+ a Redis swap-in example)
tests/          Jest + Supertest
```

## Auth

- Email/password with **access + refresh token** rotation (refresh token stored hashed, httpOnly cookie)
- **Google login**: `POST /auth/google` — needs `google-auth-library` installed and `GOOGLE_CLIENT_ID` set
- **Firebase phone OTP**: `POST /auth/firebase-phone` — needs `firebase-admin` installed and `FIREBASE_*` env vars set. Firebase's client SDK handles OTP delivery; this endpoint verifies the resulting ID token server-side.
- **Forgot/reset password**: `POST /auth/forgot-password`, `POST /auth/reset-password` — currently logs the reset token instead of emailing it; wire up `SMTP_*` + nodemailer to send it for real.

## Payments

Razorpay-shaped (`services/paymentService.js`) — needs `razorpay` installed and `RAZORPAY_*` env vars. Swap for Stripe by editing that one file; controllers/routes don't need to change.

## MongoDB Atlas setup

1. Create a free cluster at https://cloud.mongodb.com
2. Database Access → add a user with a password
3. Network Access → add your IP (or `0.0.0.0/0` for development)
4. Get the connection string and put it in `.env` as `MONGODB_URI`

## What's stubbed vs. real

Real and working: auth (register/login/refresh/logout), products/categories/brands CRUD, cart, wishlist, transactional order checkout with stock decrement, coupons, reviews + rating aggregation, notifications, seller/admin endpoints, analytics aggregations, rate limiting, input validation, error handling, security middleware (helmet/mongo-sanitize/hpp).

Needs an external service wired in before going live: Google OAuth, Firebase phone OTP, email sending (password reset / order confirmation), payment gateway (Razorpay/Stripe) — each is written against that provider's real API shape with clear `TODO`/install comments, not faked.
